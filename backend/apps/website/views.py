from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .serializers import RoomSerializer
from .models import (
    Room,
    Course, 
    Section,
    UserCourseAccessLevel,
    UserSectionAccessLevel,
    UserRoomAccessLevel,
    VisibilityLevel,
    AccessLevel,
)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_room(request, course_id, section_id):
    """
    Create a new room for a given course and section.
    POST body should include: title, description
    The authenticated user will automatically be set as the creator.
    """
    course = get_object_or_404(Course, id=course_id)
    section = get_object_or_404(Section, id=section_id, course=course)

    data = {
        "title": request.data.get("title", ""),
        "description": request.data.get("description", ""),
    }

    serializer = RoomSerializer(data=data)
    if serializer.is_valid():
        room = serializer.save(
            course=course,
            section=section,
            creator=request.user,
            metadata={},  # empty for now
        )
        return Response(
            {
                "status": "success",
                "room_id": room.id,
                "creator_id": request.user.id,
                "creator_username": request.user.username, 
            },
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def edit_room(request, course_id, section_id, room_id):
    """
    Retrieve full editable room data.
    Checks if user has access or admin rights.
    Returns ordered tasks and components.
    """
    user = request.user

    room = get_object_or_404(
        Room,
        id=room_id,
        section_id=section_id,
        course_id=course_id,
    )

    # --- ACCESS CHECK --- # the access stuff is messy as fuck rn ngl
    has_access = False

    # 1. Creator always has access
    if room.creator == user:
        has_access = True

    # 2. Course-level admin access
    elif UserCourseAccessLevel.objects.filter(
        user=user, course_id=course_id, access_level=AccessLevel.ADMIN
    ).exists():
        has_access = True

    # 3. Section-level admin access
    elif UserSectionAccessLevel.objects.filter(
        user=user, section_id=section_id, access_level=AccessLevel.ADMIN
    ).exists():
        has_access = True

    # 4. Room-level admin access
    elif UserRoomAccessLevel.objects.filter(
        user=user, room_id=room_id, access_level=AccessLevel.ADMIN
    ).exists():
        has_access = True

    # 5. Public visibility
    elif getattr(room, "visibility", None) == VisibilityLevel.PUBLIC:
        has_access = True

    # 6. Limited access check — if room visibility == LIMITER,
    # check if user is in the course or section access list
    elif getattr(room, "visibility", None) == VisibilityLevel.LIMITER:
        if UserCourseAccessLevel.objects.filter(user=user, course_id=course_id).exists() or \
           UserSectionAccessLevel.objects.filter(user=user, section_id=section_id).exists() or \
           UserRoomAccessLevel.objects.filter(user=user, room_id=room_id).exists():
            has_access = True

    if not has_access:
        return Response(
            {"detail": "You do not have permission to access this room."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # --- Serialize and return data ---
    tasks_data = []
    for task in room.tasks.all().order_by("order"):
        components_data = [
            {
                "task_component_id": comp.id,
                "type": comp.type,
                "content": comp.content,
            }
            for comp in task.components.all().order_by("order")
        ]

        tasks_data.append({
            "task_id": task.id,
            "point_value": task.point_value,
            "tags": list(task.tags.values_list("name", flat=True)),
            "components": components_data,
        })

    return Response(
        {
            "status": "success",
            "room_id": room.id,
            "is_published": room.is_published,
            "tasks": tasks_data,
        },
        status=status.HTTP_200_OK,
    )


# helper for reuse in save and publish
def _save_room_logic(request, course_id, section_id, room_id):
    """
    Handles validation and full overwrite of a room's data.
    Returns (room, errors).
    """
    room = get_object_or_404(Room, id=room_id, section_id=section_id, course_id=course_id)

    serializer = RoomSerializer(room, data=request.data)
    if serializer.is_valid():
        # Delete old data AFTER validation (cascade deletes tasks & components)
        # i think progress and access will/should also be deleted thru cascade
        room.tasks.all().delete()

        # Save new data (including nested tasks/components)
        room = serializer.save()

        return room, None

    return None, serializer.errors


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_room(request, course_id, section_id, room_id):
    """
    Overwrite the room (and its tasks/components) with new data.
    Cascade deletes old tasks/components.
    """
    room, errors = _save_room_logic(request, course_id, section_id, room_id)

    if errors:
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)

    return Response(
        {
            "status": "success",
            "room_id": room.id,
            "message": "Room saved successfully.",
        },
        status=status.HTTP_200_OK,
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def publish_room(request, course_id, section_id, room_id):
    """
    Validate and publish the room.
    Makes room visible to the public if valid.
    """
    # first update/save room with incoming data
    room, errors = _save_room_logic(request, course_id, section_id, room_id)
    if errors:
        return Response(
            {"status": "error", "errors": errors, "published": False},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # checks if there are at least 1 task in the room to publish it, can remove this if not necessary
    if not room.tasks.exists():
        return Response(
            {"status": "error", "message": "Cannot publish an empty room.", "published": False},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # publish, update visibility and is_published
    room.visibility = VisibilityLevel.PUBLIC
    room.is_published = True
    room.save(update_fields=["visibility", "is_published"])

    return Response(
        {
            "status": "success",
            "room_id": room.id,
            "published": True,
            "message": "Room published successfully.",
        },
        status=status.HTTP_200_OK,
    )
