from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.db import transaction
from django.shortcuts import get_object_or_404

from .serializers import RoomSerializer
from .models import (
    Course,
    Section,
    Room,
    VisibilityLevel
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
def get_room(request, course_id, section_id, room_id):
    """
    Retrieve full editable room data.
    Visitors can view but not save/publish.
    """
    room = get_object_or_404(Room, id=room_id, section_id=section_id, course_id=course_id)
    serializer = RoomSerializer(room, context={"request": request})

    # Only require view-level access (edit=False)
    if not serializer._user_has_access(room, request.user, edit=False):
        raise PermissionDenied("You do not have permission to view this room.")

    return Response(serializer.data)


# helper for reuse in save and publish
def _save_room_logic(request, course_id, section_id, room_id):
    """
    Handles full validation + save of a room and its nested tasks/components.
    Ensures atomic writes and permission checks.
    Returns (room, None) if success, (None, errors) if validation fails.
    """
    room = get_object_or_404(Room, id=room_id, section_id=section_id, course_id=course_id)
    serializer = RoomSerializer(room, data=request.data, context={"request": request})
    if serializer.is_valid():
        with transaction.atomic():
            return serializer.save(), None
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
