from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.db import transaction
from django.shortcuts import get_object_or_404

from .permissions import user_has_access
from .serializers import ProgressOfTaskSerializer, RoomSerializer, CourseSerializer, SectionSerializer
from .models import Badge, Course, ProgressOfTask, Section, Room, Status, Task, UserBadge, VisibilityLevel


# -------------------------------
# Task-related API calls
# -------------------------------
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_task_progress(request, task_id):
    """
    update_task_progress: Updates or creates a user's progress for a specific task.

    @param request:
        HTTP request containing "status", "attempts", and optional "metadata".
        Expected JSON body:
        {
            "status": "COMPLE",
            "attempts": 2,
            "metadata": {
                "struggling_with": "time complexity"
            }
        }
    @param task_id:
        The ID of the Task whose progress is being updated.
    @return:
        * HTTP 200: Progress successfully updated or created.
        * HTTP 400: If serializer validation fails.
        * HTTP 404: If the task does not exist.
    @note:
        - If a ProgressOfTask entry does not exist for (user, task), a new one will be created.
        - Only the authenticated user's progress is modified.
        - !!! Make sure you use "COMPLE", "NOSTAR", or "INCOMP" for "status", otherwise it will have a HTTP 400
    """
    user = request.user
    task = get_object_or_404(Task, id=task_id)

    # Get or create progress record for this user & task
    # If already created, this will not replace missing fields
    # i.e. if you only give status, attempts/metadata will stay the same
    progress, created = ProgressOfTask.objects.get_or_create(
        user=user,
        task=task,
        defaults={"status": Status.NOSTAR, "attempts": 0}
    )

    # Feed existing instance + incoming update data into serializer
    serializer = ProgressOfTaskSerializer(progress, data=request.data, partial=True)

    # Validate incoming data
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Save the update
    serializer.save()

    return Response(serializer.data, status=status.HTTP_200_OK)


# -------------------------------
# Badge-related API calls
# -------------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def award_badge(request, badge_id):
    """
    award_badge: Awards a badge to the user.

    @param request: HTTP request object.
    @param badge_id: ID of the badge being awarded.
    @return:
        * HTTP 201: Badge awarded.
        * HTTP 200: Badge already awarded.
    """
    user = request.user
    badge = get_object_or_404(Badge, id=badge_id)

    # Check if user already has this badge
    user_badge, created = UserBadge.objects.get_or_create(
        user=user,
        badge=badge
    )

    # Response body
    data = {
        "badge_id": badge.id,
        "title": badge.title,
        "image": request.build_absolute_uri(badge.image.url),
        "awarded_at": user_badge.awarded_at,
        "status": "created" if created else "already_awarded",
    }

    # If created = True → new badge awarded
    # If created = False → badge already existed
    return Response(
        data,
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_badges(request):
    """
    get_badges: Gets all of the badges that the user has.

    @param request: HTTP request object.
    @return:
        * HTTP 200: Got all the badges.
        * HTTP 204: User has no badges.
    """
    user = request.user

    user_badges = UserBadge.objects.filter(user=user).select_related("badge")

    # If the user has no badges → return 204 No Content
    if not user_badges.exists():
        return Response(status=status.HTTP_204_NO_CONTENT)

    data = [
        {
            "badge_id": ub.badge.id,
            "title": ub.badge.title,
            "image": request.build_absolute_uri(ub.badge.image.url),
            "awarded_at": ub.awarded_at
        }
        for ub in user_badges
    ]

    return Response(data, status=status.HTTP_200_OK)


# -------------------------------
# Course-related API calls
# -------------------------------
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_course(request, course_id):
    """
    delete_course: Deletes a course.

    @param request: HTTP request object.
    @param course_id: ID of the course.
    @return:
        * HTTP 204: Course was successfully deleted.
        * HTTP 403: If the user cannot edit the course.
    """
    user = request.user

    course = get_object_or_404(Course, id=course_id)

    if not user_has_access(course, user):
        raise PermissionDenied("You do not have permission to delete this course.")

    course.delete()

    return Response(
        {"status": "success", "message": "Course deleted.", "course_id": course_id},
        status=status.HTTP_204_NO_CONTENT
    )


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
        # permissiondenied also gives HTTP 403
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_course_progress(request, course_id):
    """
    get_course_progress: Get the total progress of the course as a percentage.

    @param request: HTTP request object.
    @param course_id: ID of the course.
    @return:
        * HTTP 200: Got the progress (will return this even if the progress is 0%).
    """
    user = request.user

    # Use your custom QuerySet filter
    qs = Course.objects.filter_by_user_access(user)
    
    # Annotate progress for this specific course
    course_qs = qs.filter(id=course_id).user_progress_percent(user)

    # If the user doesn't have access → 404
    course = course_qs.first()
    if not course:
        return Response(
            {"detail": "Course not found or access denied."},
            status=status.HTTP_404_NOT_FOUND
        )

    # Build response
    data = {
        "course_id": course.id,
        "title": course.title,
        "progress_percent": round(course.progress_percent or 0, 2),
        "completed_tasks": course.completed_tasks,
        "total_tasks": course.total_tasks,
    }

    return Response(data, status=status.HTTP_200_OK)


# -------------------------------
# Section-related API calls
# -------------------------------
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_section(request, section_id):
    """
    delete_section: Deletes a section.

    @param request: HTTP request object.
    @param section_id: ID of the section.
    @return:
        * HTTP 204: Section was successfully deleted.
        * HTTP 403: If the user cannot edit the section.
    """
    user = request.user

    section = get_object_or_404(Section, id=section_id)

    if not user_has_access(section, user):
        raise PermissionDenied("You do not have permission to delete this section.")

    section.delete()

    return Response(
        {"status": "success", "message": "Section deleted.", "section_id": section_id},
        status=status.HTTP_204_NO_CONTENT
    )


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
    @example request:
        {
            "title": "Basics of AI slop",
            "description": "A beginner-level section."
        }
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_section_progress(request, section_id):
    """
    get_section_progress: Get the total progress of the section as a percentage.

    @param request: HTTP request object.
    @param section_id: ID of the section.
    @return:
        * HTTP 200: Got the progress (will return this even if the progress is 0%).
    """
    user = request.user

    # Use your custom QuerySet filter
    qs = Section.objects.filter_by_user_access(user)
    
    # Annotate progress for this specific section
    section_qs = qs.filter(id=section_id).user_progress_percent(user)

    # If the user doesn't have access → 404
    section = section_qs.first()
    if not section:
        return Response(
            {"detail": "Section not found or access denied."},
            status=status.HTTP_404_NOT_FOUND
        )

    # Build response
    data = {
        "section_id": section.id,
        "title": section.title,
        "progress_percent": round(section.progress_percent or 0, 2),
        "completed_tasks": section.completed_tasks,
        "total_tasks": section.total_tasks,
    }

    return Response(data, status=status.HTTP_200_OK)


# -------------------------------
# Room-related API calls
# -------------------------------
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_room(request, room_id):
    """
    delete_room: Deletes a room.

    @param request: HTTP request object.
    @param room_id: ID of the room.
    @return:
        * HTTP 204: Room was successfully deleted.
        * HTTP 403: If the user cannot edit the room.
    """
    user = request.user

    room = get_object_or_404(Room, id=room_id)

    if not user_has_access(room, user):
        raise PermissionDenied("You do not have permission to delete this room.")

    room.delete()

    return Response(
        {"status": "success", "message": "Room deleted.", "room_id": room_id},
        status=status.HTTP_204_NO_CONTENT
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_rooms(request, section_id):
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
    get_object_or_404(Section, id=section_id)

    viewable_rooms_qs = (
        Room.objects
            .filter(section_id=section_id)
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
    @example request:
        {
            "title": "AI slop assignment 1",
            "description": "A beginner-level room."
        }
    """
    course = get_object_or_404(Course, id=course_id)
    section = get_object_or_404(Section, id=section_id)

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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_room_progress(request, room_id):
    """
    get_room_progress: Get the total progress of the room as a percentage.

    @param request: HTTP request object.
    @param room_id: ID of the room.
    @return:
        * HTTP 200: Got the progress (will return this even if the progress is 0%).
    """
    user = request.user

    # Use your custom QuerySet filter
    qs = Room.objects.filter_by_user_access(user)
    
    # Annotate progress for this specific room
    room_qs = qs.filter(id=room_id).user_progress_percent(user)

    # If the user doesn't have access → 404
    room = room_qs.first()
    if not room:
        return Response(
            {"detail": "Room not found or access denied."},
            status=status.HTTP_404_NOT_FOUND
        )

    # Build response
    data = {
        "room_id": room.id,
        "title": room.title,
        "progress_percent": round(room.progress_percent or 0, 2),
        "completed_tasks": room.completed_tasks,
        "total_tasks": room.total_tasks,
    }

    return Response(data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_room(request, room_id):
    """
    get_room: Retrieves details for a specific room.

    @param request: HTTP request object.
    @param room_id: ID of the room.
    @return:
        * HTTP 200: Serialized room data.
        * HTTP 403: If user lacks permission.
        * HTTP 404: If the room does not exist.
    @note:
        Checks hierarchical user access before returning data.
    """
    room = get_object_or_404(Room, id=room_id)

    if not user_has_access(room, request.user, edit=False):
        raise PermissionDenied("You do not have permission to view this room.")

    serializer = RoomSerializer(room, context={"request": request})
    return Response(serializer.data, status=status.HTTP_200_OK)


# -------------------------------
# Helper for save/publish logic
# -------------------------------
def _save_room_logic(request, room_id):
    """
    _save_room_logic: Internal helper to validate and save a room (and nested entities).

    @param request: HTTP request object containing full room JSON.
    @param room_id: ID of the room being updated.
    @return:
        Tuple of (room, None) on success or (None, serializer_errors) on failure.
    @note:
        All operations occur within an atomic transaction to ensure consistency.
    """
    room = get_object_or_404(Room, id=room_id)
    serializer = RoomSerializer(room, data=request.data, context={"request": request})
    if serializer.is_valid():
        with transaction.atomic():
            return serializer.save(), None
    return None, serializer.errors


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def save_room(request, room_id):
    """
    save_room: Overwrites an existing room (and its nested components) with new data.

    @param request: HTTP request containing the full updated room JSON.
    @param room_id: ID of the room being updated.
    @return:
        * HTTP 200: On successful save.
        * HTTP 400: If serializer validation fails.
    @note:
        Validation and save are atomic. Removed components are cascade-deleted.
    """
    room, errors = _save_room_logic(request, room_id)

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
def publish_room(request, room_id):
    """
    publish_room: Validates and publishes a room, making it publicly visible.

    @param request: HTTP request containing room data for validation and publishing.
    @param room_id: ID of the room being published.
    @return:
        * HTTP 200: If published successfully.
        * HTTP 400: If validation fails or room has no tasks.
    @note:
        A room must contain at least one task before publishing. Visibility is set to PUBLIC.
    """
    room, errors = _save_room_logic(request, room_id)
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


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_task_progress_for_room(request, course_id, section_id, room_id):
    """
    get_task_progress_for_room: Retrieves task progress for all tasks in a room.

    @param request: HTTP request object.
    @param course_id: ID of the parent course.
    @param section_id: ID of the parent section.
    @param room_id: ID of the room.
    @return:
        * HTTP 200: List of task progress data.
        * HTTP 403: If user lacks permission to view the room.
        * HTTP 404: If the room does not exist.
    @note:
        Checks room access, gets all task IDs in the room, and returns
        ProgressOfTask entries for the current user matching those task IDs.
    """
    # Check if room exists and user has access
    room = get_object_or_404(Room, id=room_id, section_id=section_id, course_id=course_id)
    
    if not user_has_access(room, request.user, edit=False):
        raise PermissionDenied("You do not have permission to view this room.")
    
    # Get list of task IDs for all tasks in room
    task_ids = list(room.tasks.values_list('id', flat=True))
    
    # Get ProgressOfTask entries for user where task is in the task_ids list
    progress_entries = ProgressOfTask.objects.filter(
        user=request.user,
        task_id__in=task_ids
    )
    
    # Serialize and return the data
    serializer = ProgressOfTaskSerializer(progress_entries, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


"""
#todo: update with newer one 
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