from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.db import transaction
from django.shortcuts import get_object_or_404

from .permissions import user_has_access
from .serializers import RoomSerializer, CourseSerializer, SectionSerializer
from .models import Course, Section, Room, VisibilityLevel


# TODO: delete_section, delete_course, delete_room
# go to admins, click on spec instance, sample url contains id (all are 1)


# -------------------------------
# Course-related API calls
# -------------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_courses(request):
    """
    get_courses: Retrieves all courses the user can view, annotated with progress.

    @param request: HTTP request object.
    @return:
        * HTTP 200: List of courses the user can access.
        * HTTP 403: If the user cannot view any courses.
    @note:
        This endpoint filters courses by user access and includes progress annotations.
    """
    user = request.user

    viewable_courses_qs = (
        Course.objects
              .filter_by_user_access(user)
              .user_progress_percent(user)
    )

    if not viewable_courses_qs.exists():
        raise PermissionDenied("You do not have permission to view any courses.")

    serializer = CourseSerializer(viewable_courses_qs, many=True, context={"request": request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_course(request):
    """
    create_course: Creates a new course.

    @param request: HTTP request containing "title" and optional "description".
    @return:
        * HTTP 201: On success, returns created course info.
        * HTTP 400: If serializer validation fails.
    @note:
        The authenticated user is automatically set as the course creator.
    @example request:
        {
            "title": "Intro to AI",
            "description": "A beginner-level course."
        }
    """
    data = {
        "title": request.data.get("title", ""),
        "description": request.data.get("description", ""),
    }

    serializer = CourseSerializer(data=data)
    if serializer.is_valid():
        course = serializer.save(
            creator=request.user,
            metadata={},  # empty for now
        )
        return Response(
            {
                "status": "success",
                "course_id": course.id,
                "creator_id": request.user.id,
                "creator_username": request.user.username,
            },
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# -------------------------------
# Section-related API calls
# -------------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_sections(request, course_id):
    """
    get_sections: Retrieves all sections for a given course that the user can view.

    @param request: HTTP request object.
    @param course_id: ID of the parent course.
    @return:
        * HTTP 200: List of sections the user can access.
        * HTTP 403: If no accessible sections exist.
        * HTTP 404: If the course does not exist.
    @note:
        Filters sections by user access and annotates with progress percentage.
    """
    user = request.user
    get_object_or_404(Course, id=course_id)

    viewable_sections_qs = (
        Section.objects
               .filter(course_id=course_id)
               .filter_by_user_access(user)
               .user_progress_percent(user)
    )

    if not viewable_sections_qs.exists():
        raise PermissionDenied("You do not have permission to view any sections in this course.")

    serializer = SectionSerializer(viewable_sections_qs, many=True, context={"request": request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_section(request, course_id):
    """
    create_section: Creates a new section under a specific course.

    @param request: HTTP request containing "title" and optional "description".
    @param course_id: ID of the parent course.
    @return:
        * HTTP 201: On success, returns section creation details.
        * HTTP 400: If serializer validation fails.
        * HTTP 404: If the parent course does not exist.
    @note:
        The authenticated user is automatically set as the section creator.
    """
    course = get_object_or_404(Course, id=course_id)

    data = {
        "title": request.data.get("title", ""),
        "description": request.data.get("description", ""),
    }

    serializer = SectionSerializer(data=data)
    if serializer.is_valid():
        section = serializer.save(
            course=course,
            creator=request.user,
            metadata={},
        )
        return Response(
            {
                "status": "success",
                "section_id": section.id,
                "creator_id": request.user.id,
                "creator_username": request.user.username,
            },
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# -------------------------------
# Room-related API calls
# -------------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_rooms(request, course_id, section_id):
    """
    get_rooms: Retrieves all rooms for a given course and section that the user can view.

    @param request: HTTP request object.
    @param course_id: ID of the parent course.
    @param section_id: ID of the parent section.
    @return:
        * HTTP 200: List of accessible rooms.
        * HTTP 403: If user cannot view any rooms.
        * HTTP 404: If section or course does not exist.
    @note:
        Queryset is filtered by user access and annotated with progress data.
    """
    user = request.user
    get_object_or_404(Section, id=section_id, course_id=course_id)

    viewable_rooms_qs = (
        Room.objects
            .filter(course_id=course_id, section_id=section_id)
            .filter_by_user_access(user)
            .user_progress_percent(user)
    )

    if not viewable_rooms_qs.exists():
        raise PermissionDenied("You do not have permission to view any rooms in this section.")

    serializer = RoomSerializer(viewable_rooms_qs, many=True, context={"request": request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_room(request, course_id, section_id):
    """
    create_room: Creates a new room for a specific course and section.

    @param request: HTTP request containing "title" and optional "description".
    @param course_id: ID of the parent course.
    @param section_id: ID of the parent section.
    @return:
        * HTTP 201: On success, returns room creation details.
        * HTTP 400: If serializer validation fails.
        * HTTP 404: If parent course or section does not exist.
    @note:
        The authenticated user is automatically set as the room creator.
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
            metadata={},
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
    get_room: Retrieves details for a specific room.

    @param request: HTTP request object.
    @param course_id: ID of the parent course.
    @param section_id: ID of the parent section.
    @param room_id: ID of the room.
    @return:
        * HTTP 200: Serialized room data.
        * HTTP 403: If user lacks permission.
        * HTTP 404: If the room does not exist.
    @note:
        Checks hierarchical user access before returning data.
    """
    room = get_object_or_404(Room, id=room_id, section_id=section_id, course_id=course_id)

    if not user_has_access(room, request.user, edit=False):
        raise PermissionDenied("You do not have permission to view this room.")

    serializer = RoomSerializer(room, context={"request": request})
    return Response(serializer.data, status=status.HTTP_200_OK)


# -------------------------------
# Helper for save/publish logic
# -------------------------------
def _save_room_logic(request, course_id, section_id, room_id):
    """
    _save_room_logic: Internal helper to validate and save a room (and nested entities).

    @param request: HTTP request object containing full room JSON.
    @param course_id: ID of the parent course.
    @param section_id: ID of the parent section.
    @param room_id: ID of the room being updated.
    @return:
        Tuple of (room, None) on success or (None, serializer_errors) on failure.
    @note:
        All operations occur within an atomic transaction to ensure consistency.
    """
    room = get_object_or_404(Room, id=room_id, section_id=section_id, course_id=course_id)
    serializer = RoomSerializer(room, data=request.data, context={"request": request})

    if serializer.is_valid():
        with transaction.atomic():
            return serializer.save(), None
    return None, serializer.errors


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def save_room(request, course_id, section_id, room_id):
    """
    save_room: Overwrites an existing room (and its nested components) with new data.

    @param request: HTTP request containing the full updated room JSON.
    @param course_id: ID of the parent course.
    @param section_id: ID of the parent section.
    @param room_id: ID of the room being updated.
    @return:
        * HTTP 200: On successful save.
        * HTTP 400: If serializer validation fails.
    @note:
        Validation and save are atomic. Removed components are cascade-deleted.
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


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def publish_room(request, course_id, section_id, room_id):
    """
    publish_room: Validates and publishes a room, making it publicly visible.

    @param request: HTTP request containing room data for validation and publishing.
    @param course_id: ID of the parent course.
    @param section_id: ID of the parent section.
    @param room_id: ID of the room being published.
    @return:
        * HTTP 200: If published successfully.
        * HTTP 400: If validation fails or room has no tasks.
    @note:
        A room must contain at least one task before publishing. Visibility is set to PUBLIC.
    """
    room, errors = _save_room_logic(request, course_id, section_id, room_id)
    if errors:
        return Response(
            {"status": "error", "errors": errors, "published": False},
            status=status.HTTP_400_BAD_REQUEST,
        )


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


"""
@NOTE: When it says *full room JSON structure* above, it means the following:
{
  "title": "Introduction to Python",
  "description": "A practice room for basic Python exercises.",
  "metadata": {
    "estimated_time": "15 minutes",
    "notes": "Example note."
  },
  "visibility": "PRIVATE", 
  "is_published": false,
  "tasks": [
    {
      "task_id": 1,
      "tags": ["syntax", "variables"], 
      "components": [
        {
          "task_component_id": 11,
          "type": "text",
          "content": {
            "text": "What is a variable in Python?"
          }
        },
        {
          "task_component_id": 12,
          "type": "image",
          "content": {
            "url": example.com
          }
        }
      ]
    },
    {
      "task_id": 2,
      "tags": ["functions"],
      "components": [
        {
          "task_component_id": 21,
          "type": "text",
          "content": {
            "text": "Define a function that returns the square of a number."
          }
        }
      ]
    }
  ]
}
"""