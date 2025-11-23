from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.db import transaction
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiResponse, extend_schema, OpenApiExample
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers

from .permissions import user_has_access
from .serializers import BadgeSerializer, ProgressOfTaskSerializer, RoomSerializer, CourseSerializer, SectionSerializer, UserBadgeSerializer
from .models import Badge, Course, ProgressOfTask, Section, Room, Status, Task, UserBadge, VisibilityLevel


# # user info apis
#     path("user_info/", views.get_user_info),
#     path("other_user_info/", views.get_another_user_info),

#     # user badges apis
#     path("another_badges/", views.get_another_badges),


# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_courses_created(request):
#     """
#     get_courses_created: Gets all courses created by the logged in user.

#     @param request: HTTP request object.
#     @return:
#         * HTTP 200: Got all the courses
#         * HTTP 204: User has no courses that they have created
#     """
#     user = request.user

#     courses = Course.objects.filter(creator=user)

#     if not courses.exists():
#         return Response(
#             {"detail": "You have not created any courses."},
#             status=status.HTTP_204_NO_CONTENT
#         )

#     serializer = CourseSerializer(courses, many=True)
#     return Response(serializer.data, status=status.HTTP_200_OK)


# -------------------------------
# User-related API calls
# -------------------------------
api_view('PUT')
@permission_classes([IsAuthenticated])
def update_user_info(request):
    user = request.user

    # prof pic and desc only

    return 0

api_view('GET')
@permission_classes([IsAuthenticated])
def get_user_info(request):
    user = request.user

    courses = Course.objects.filter(creator=user)

    if not courses.exists():
        return Response(
            {"detail": "You have not created any courses."},
            status=status.HTTP_204_NO_CONTENT
        )

    serializer = CourseSerializer(courses, many=True) # change this to just be "courses_created": <# of courses>

    return Response(serializer.data, status=status.HTTP_200_OK)

api_view('GET')
@permission_classes([IsAuthenticated])
def get_another_user_info(request, user_id):
    

    return 0

# -------------------------------
# Task-related API calls
# -------------------------------
@extend_schema(
    tags=["Tasks"],
    summary="Update the progress of a task",
    description="Updates or creates a user's progress for a specific task. If a ProgressOfTask entry does not exist for (user, task), a new one will be created. Only the authenticated user's progress is modified. Make sure you use 'COMPLE', 'NOSTAR', or 'INCOMP' for 'status', otherwise it will have a HTTP 400.",
    
    # 2. Define your CUSTOM response structure here
    responses={
        200: ProgressOfTaskSerializer,
        400: OpenApiResponse(description='Serializer Failed.'),
        404: OpenApiResponse(description='Could not get task.'),
    }
)
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_task_progress(request, task_id):
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


@extend_schema(
    tags=["Tasks"],
    summary="Get the progress of a room",
    description="Retrieves task progress for all tasks in a room.",
    
    # 2. Define your CUSTOM response structure here
    responses={
        200: ProgressOfTaskSerializer,
        403: OpenApiResponse(description='User does not have permission to view this room.'),
        404: OpenApiResponse(description='Could not get room.'),
    }
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_task_progress_for_room(request, course_id, section_id, room_id):
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


# -------------------------------
# Badge-related API calls
# -------------------------------
api_view('GET')
@permission_classes([IsAuthenticated])
def get_another_badges(request, user_id):
    

    return 0


@extend_schema(
    tags=["Badges"],
    summary="Award a badge",
    description="Creates a UserBadge object to represent the 'User has a Badge' relation.",
    
    # 2. Define your CUSTOM response structure here
    responses={
        201: UserBadgeSerializer,
        409: OpenApiResponse(description='Badge was already awarded. Cannot be awarded again'),
        400: OpenApiResponse(description='Serializer Failed.'),
        404: OpenApiResponse(description='Could not get badge.'),
    }
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def award_badge(request, badge_id):
    user = request.user
    badge = get_object_or_404(Badge, id=badge_id)

    # Check if user already has this badge
    user_badge, created = UserBadge.objects.get_or_create(
        user=user,
        badge=badge
    )

    # Serialize and return the data
    serializer = UserBadgeSerializer(user_badge)

    # Validate incoming data
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if created:
        return Response(status=status.HTTP_409_CONFLICT)

    return Response(serializer.data, status=status.HTTP_201_CREATED)


@extend_schema(
    tags=["Badges"],
    summary="Get user's badges",
    description="Gets all of the badges that the user has (meaning that a UserBadge relation exists).",
    
    # 2. Define your CUSTOM response structure here
    responses={
        200: UserBadgeSerializer,
        204: OpenApiResponse(description='User has no badges.'),
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_badges(request):
    user = request.user

    user_badges = UserBadge.objects.filter(user=user).select_related("badge")

    # If the user has no badges → return 204 No Content
    if not user_badges.exists():
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    # Serialize and return the data
    serializer = UserBadgeSerializer(user_badges, many=True)

    return Response(serializer.data, status=status.HTTP_200_OK)


# -------------------------------
# Course-related API calls
# -------------------------------
@extend_schema(
    tags=["Courses"],
    summary="Delete a course",
    description="Deletes a course and everything that that course contains: sections/rooms/etc..",
    
    # 2. Define your CUSTOM response structure here
    responses={
        204: OpenApiResponse(description='Course deleted successfully.'),
        403: OpenApiResponse(description='You do not have permission to delete this course.'),
        404: OpenApiResponse(description='Could not get course.'),
    }
)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_course(request, course_id):
    user = request.user

    course = get_object_or_404(Course, id=course_id)

    if not user_has_access(course, user):
        raise PermissionDenied("You do not have permission to delete this course.")

    course.delete()

    return Response(status=status.HTTP_204_NO_CONTENT)


@extend_schema(
    tags=["Courses"],
    summary="Get courses",
    description="Retrieves all courses the user can view, annotated with progress.",
    
    # 2. Define your CUSTOM response structure here
    responses={
        200: CourseSerializer(),
        403: OpenApiResponse(description='You do not have permission to view any courses.'),
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_courses(request):
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


@extend_schema(
    tags=["Courses"],
    summary="Create a new course",
    description="Creates a course and assigns the current user as creator. The authenticated user is automatically set as the course creator.",
    # 1. Tell Docs to show the form fields for Title and Description
    request=inline_serializer(
        name="CreateCourseRequest",
        fields={
            "title": serializers.CharField(),
            "description": serializers.CharField(),
        }
    ), 
    
    # 2. Define your CUSTOM response structure here
    responses={
        201: CourseSerializer(),
        400: OpenApiResponse(description='Serializer Failed.'),
    }
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_course(request):
    data = {
        "title": request.data.get("title", ""),
        "description": request.data.get("description", ""),
    }

    serializer = CourseSerializer(data=data)
    if serializer.is_valid():
        serializer.save(
            creator=request.user,
            metadata={},  # empty for now
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=["Courses"],
    summary="Get course progress",
    description="Get the total progress of the course as a percentage.",
    
    # 2. Define your CUSTOM response structure here
    responses={
        200: inline_serializer(
            name="GetCourseProgressResponse",
            fields={
                "course_id": serializers.IntegerField(),
                "title": serializers.CharField(),
                "progress_percent": serializers.FloatField(),
                "completed_tasks": serializers.IntegerField(),
                "total_tasks": serializers.IntegerField(),
            }
        ),
        204: OpenApiResponse(description='No courses found. Maybe check user permissions.'),
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_course_progress(request, course_id):
    user = request.user

    # Use your custom QuerySet filter
    qs = Course.objects.filter_by_user_access(user)
    
    # Annotate progress for this specific course
    course_qs = qs.filter(id=course_id).user_progress_percent(user)

    # If the user doesn't have access → 204
    course = course_qs.first()
    if not course:
        return Response(status=status.HTTP_204_NO_CONTENT)

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
@extend_schema(
    tags=["Sections"],
    summary="Delete a section",
    description="Deletes a section and everything that that section contains: rooms/etc..",
    
    # 2. Define your CUSTOM response structure here
    responses={
        204: OpenApiResponse(description='Section deleted successfully.'),
        403: OpenApiResponse(description='You do not have permission to delete this section.'),
        404: OpenApiResponse(description='Could not get section.'),
    }
)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_section(request, section_id):
    user = request.user

    section = get_object_or_404(Section, id=section_id)

    if not user_has_access(section, user):
        raise PermissionDenied("You do not have permission to delete this section.")

    section.delete()

    return Response(status=status.HTTP_204_NO_CONTENT)


@extend_schema(
    tags=["Sections"],
    summary="Get sections",
    description="Retrieves all sections the user can view, annotated with progress.",
    
    # 2. Define your CUSTOM response structure here
    responses={
        200: SectionSerializer(),
        403: OpenApiResponse(description='You do not have permission to view any sections.'),
        404: OpenApiResponse(description='Could not get course that the section is in.'),
    }
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


@extend_schema(
    tags=["Sections"],
    summary="Create a new section",
    description="Creates a section and assigns the current user as creator. The authenticated user is automatically set as the section creator.",
    # 1. Tell Docs to show the form fields for Title and Description
    request=inline_serializer(
        name="CreateSectionRequest",
        fields={
            "title": serializers.CharField(),
            "description": serializers.CharField(),
        }
    ), 
    
    # 2. Define your CUSTOM response structure here
    responses={
        201: SectionSerializer(),
        404: OpenApiResponse(description='Could not get course that the section is in.'),
        400: OpenApiResponse(description='Serializer Failed.'),
    }
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_section(request, course_id):
    course = get_object_or_404(Course, id=course_id)

    data = {
        "title": request.data.get("title", ""),
        "description": request.data.get("description", ""),
    }

    serializer = SectionSerializer(data=data)
    if serializer.is_valid():
        serializer.save(
            course=course,
            creator=request.user,
            metadata={},
        )
        return Response(serializer.data,status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=["Sections"],
    summary="Get section progress",
    description="Get the total progress of the section as a percentage.",
    
    # 2. Define your CUSTOM response structure here
    responses={
        200: inline_serializer(
            name="GetSectionProgressResponse",
            fields={
                "section_id": serializers.IntegerField(),
                "title": serializers.CharField(),
                "progress_percent": serializers.FloatField(),
                "completed_tasks": serializers.IntegerField(),
                "total_tasks": serializers.IntegerField(),
            }
        ),
        204: OpenApiResponse(description='No section found. Maybe check user permissions.'),
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_section_progress(request, section_id):
    user = request.user

    # Use your custom QuerySet filter
    qs = Section.objects.filter_by_user_access(user)
    
    # Annotate progress for this specific section
    section_qs = qs.filter(id=section_id).user_progress_percent(user)

    # If the user doesn't have access → 204
    section = section_qs.first()
    if not section:
        return Response(status=status.HTTP_204_NO_CONTENT)

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
@extend_schema(
    tags=["Rooms"],
    summary="Delete a room",
    description="Deletes a room and everything that that room contains: tasks/etc..",
    
    # 2. Define your CUSTOM response structure here
    responses={
        204: OpenApiResponse(description='Room deleted successfully.'),
        403: OpenApiResponse(description='You do not have permission to delete this room.'),
        404: OpenApiResponse(description='Could not get room.'),
    }
)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_room(request, room_id):
    user = request.user

    room = get_object_or_404(Room, id=room_id)

    if not user_has_access(room, user):
        raise PermissionDenied("You do not have permission to delete this room.")

    room.delete()

    return Response(status=status.HTTP_204_NO_CONTENT)


@extend_schema(
    tags=["Rooms"],
    summary="Get rooms",
    description="Retrieves all rooms the user can view, annotated with progress.",
    
    # 2. Define your CUSTOM response structure here
    responses={
        200: RoomSerializer(),
        403: OpenApiResponse(description='You do not have permission to view any rooms.'),
        404: OpenApiResponse(description='Could not get course or section that the room is in.'),
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_rooms(request, section_id):
    user = request.user
    get_object_or_404(Section, id=section_id)

    viewable_rooms_qs = (
        Room.objects
            .filter(section_id=section_id)
            .filter_by_user_access(user)
            .user_progress_percent(user)
    )

    if not viewable_rooms_qs.exists():
        raise PermissionDenied("You do not have permission to view any rooms.")

    serializer = RoomSerializer(viewable_rooms_qs, many=True, context={"request": request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(
    tags=["Rooms"],
    summary="Create a new room",
    description="Creates a room and assigns the current user as creator. The authenticated user is automatically set as the room creator.",
    # 1. Tell Docs to show the form fields for Title and Description
    request=inline_serializer(
        name="CreateRoomRequest",
        fields={
            "title": serializers.CharField(),
            "description": serializers.CharField(),
        }
    ), 
    
    # 2. Define your CUSTOM response structure here
    responses={
        201: RoomSerializer(),
        404: OpenApiResponse(description='Could not get course or section that the room is in.'),
        400: OpenApiResponse(description='Serializer Failed.'),
    }
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_room(request, course_id, section_id):
    course = get_object_or_404(Course, id=course_id)
    section = get_object_or_404(Section, id=section_id)

    data = {
        "title": request.data.get("title", ""),
        "description": request.data.get("description", ""),
    }

    serializer = RoomSerializer(data=data)
    if serializer.is_valid():
        serializer.save(
            course=course,
            section=section,
            creator=request.user,
            metadata={},
        )
        return Response(serializer.data,status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=["Rooms"],
    summary="Get room progress",
    description="Get the total progress of the room as a percentage.",
    
    # 2. Define your CUSTOM response structure here
    responses={
        200: inline_serializer(
            name="GetRoomProgressResponse",
            fields={
                "room_id": serializers.IntegerField(),
                "title": serializers.CharField(),
                "progress_percent": serializers.FloatField(),
                "completed_tasks": serializers.IntegerField(),
                "total_tasks": serializers.IntegerField(),
            }
        ),
        204: OpenApiResponse(description='No room found. Maybe check user permissions.'),
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_room_progress(request, room_id):
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


@extend_schema(
    tags=["Rooms"],
    summary="Get a room",
    description="Retrieves a room the user can view",
    
    # 2. Define your CUSTOM response structure here
    responses={
        200: RoomSerializer(),
        403: OpenApiResponse(description='You do not have permission to view this room.'),
        404: OpenApiResponse(description='Could not get room.'),
    }
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_room(request, room_id):
    room = get_object_or_404(Room, id=room_id)

    if not user_has_access(room, request.user, edit=False):
        raise PermissionDenied("You do not have permission to view this room.")

    serializer = RoomSerializer(room, context={"request": request})
    return Response(serializer.data, status=status.HTTP_200_OK)


# -------------------------------
# Helper for save/publish logic
# -------------------------------
def _save_room_logic(request, room_id):
    room = get_object_or_404(Room, id=room_id)
    serializer = RoomSerializer(room, data=request.data, context={"request": request})
    if serializer.is_valid():
        with transaction.atomic():
            return serializer.save(), None
    return None, serializer.errors


@extend_schema(
    tags=["Rooms"],
    summary="Save a room",
    description="Overwrites an existing room (and its nested components) with new data. Validation and save are atomic. Removed components are cascade-deleted.",
    
    # 2. Define your CUSTOM response structure here
    responses={
        200: OpenApiResponse(description='Room saved successfully.'),
        400: OpenApiResponse(description='Serializer Failed.'),
        403: OpenApiResponse(description='You do not have permission to edit this room.'),
        404: OpenApiResponse(description='Could not get room.'),
    }
)
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def save_room(request, room_id):
    # room is a room instance, not the serializer
    room, errors = _save_room_logic(request, room_id)

    if errors:
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)
    
    if not user_has_access(room, request.user, edit=True):
        raise PermissionDenied("You do not have permission to edit this room.")

    return Response(status=status.HTTP_200_OK)


@extend_schema(
    tags=["Rooms"],
    summary="Publish a room",
    description="Validates and publishes a room, making it publicly visible. A room must contain at least one task before publishing. Visibility is set to PUBLIC.",
    
    # 2. Define your CUSTOM response structure here
    responses={
        200: OpenApiResponse(description='Room published successfully.'),
        400: OpenApiResponse(description='Serializer Failed.'),
        403: OpenApiResponse(description='You do not have permission to edit this room.'),
        404: OpenApiResponse(description='Could not get room.'),
        406: OpenApiResponse(description='You must have at least one task before publishing.'),
    }
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
            {"errors": errors, "published": False},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not room.tasks.exists():
        return Response(status=status.HTTP_406_NOT_ACCEPTABLE)

    # publish, update visibility and is_published
    room.visibility = VisibilityLevel.PUBLIC
    room.is_published = True
    room.save(update_fields=["visibility", "is_published"])

    return Response(status=status.HTTP_200_OK)