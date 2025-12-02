from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.db import transaction
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiResponse, extend_schema
from drf_spectacular.utils import extend_schema, inline_serializer, OpenApiParameter
from rest_framework import serializers
import json

from .permissions import user_has_access
from .serializers import (
    ProgressOfTaskSerializer,
    RoomSerializer,
    CourseSerializer,
    SectionSerializer,
    UserBadgeSerializer,
    BadgeSerializer,
    UserCourseAccessLevelSerializer,
    UserRoomAccessLevelSerializer,
)
from .models import (
    Badge,
    Course,
    ProgressOfTask,
    Section,
    Room,
    Status,
    Tag,
    Task,
    TaskComponent,
    UserBadge,
    UserCourseAccessLevel,
    UserRoomAccessLevel,
    UserSectionAccessLevel,
    VisibilityLevel,
)

User = get_user_model()


# -------------------------------
# Task-related API calls
# -------------------------------
@extend_schema(
    tags=["Tasks"],
    summary="Update the progress of a task",
    description="Updates or creates a user's progress for a specific task. If a ProgressOfTask entry does not exist for (user, task), a new one will be created. Only the authenticated user's progress is modified. Make sure you use 'COMPLE', 'NOSTAR', or 'INCOMP' for 'status', otherwise it will have a HTTP 400.",
    request=None,
    responses={
        200: ProgressOfTaskSerializer,
        400: OpenApiResponse(description="Serializer Failed."),
        404: OpenApiResponse(description="Could not get task."),
    },
)
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_task_progress(request, task_id):
    user = request.user
    task = get_object_or_404(Task, id=task_id)

    # Get or create progress record for this user & task
    # If already created, this will not replace missing fields
    # i.e. if you only give status, attempts/metadata will stay the same
    progress, created = ProgressOfTask.objects.get_or_create(
        user=user, task=task, defaults={"status": Status.NOSTAR, "attempts": 0}
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
    responses={
        200: ProgressOfTaskSerializer,
        403: OpenApiResponse(
            description="User does not have permission to view this room."
        ),
        404: OpenApiResponse(description="Could not get room."),
    },
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
    room = get_object_or_404(Room, id=room_id)

    if not user_has_access(room, request.user, edit=False):
        raise PermissionDenied("You do not have permission to view this room.")

    # Get list of task IDs for all tasks in room
    task_ids = list(room.tasks.values_list("id", flat=True))

    # Get ProgressOfTask entries for user where task is in the task_ids list
    progress_entries = ProgressOfTask.objects.filter(
        user=request.user, task_id__in=task_ids
    )

    # Serialize and return the data
    serializer = ProgressOfTaskSerializer(progress_entries, many=True)

    return Response(serializer.data, status=status.HTTP_200_OK)


# -------------------------------
# Badge-related API calls
# -------------------------------
@extend_schema(
    tags=["Badges"],
    summary="Get the badges of another user.",
    description="Retrieves task progress for all tasks in a room.",
    responses={
        200: UserBadgeSerializer,
        204: OpenApiResponse(description="User has no badges."),
        404: OpenApiResponse(description="Could not get user."),
    },
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_another_badges(request, user_username):
    # Get the user (404 if not found)
    user = get_object_or_404(User, username=user_username)

    # Get all badges for that user
    user_badges = UserBadge.objects.filter(user=user).select_related("badge")

    # If the user has no badges → return 204 No Content
    if not user_badges.exists():
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = UserBadgeSerializer(user_badges, many=True)

    return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(
    tags=["Badges"],
    summary="Award a badge",
    description="Creates a UserBadge object to represent the 'User has a Badge' relation.",
    request=None,
    responses={
        201: UserBadgeSerializer,
        409: OpenApiResponse(
            description="Badge was already awarded. Cannot be awarded again"
        ),
        400: OpenApiResponse(description="Serializer Failed."),
        404: OpenApiResponse(description="Could not get badge."),
    },
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def award_badge(request, badge_id):
    user = request.user
    badge = get_object_or_404(Badge, id=badge_id)

    # Check if user already has this badge
    user_badge, created = UserBadge.objects.get_or_create(user=user, badge=badge)

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
    responses={
        200: UserBadgeSerializer,
        204: OpenApiResponse(description="User has no badges."),
    },
)
@api_view(["GET"])
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
    responses={
        204: OpenApiResponse(description="Course deleted successfully."),
        403: OpenApiResponse(
            description="You do not have permission to delete this course."
        ),
        404: OpenApiResponse(description="Could not get course."),
    },
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_badge(request):
    data = {
        "title": request.data.get("title", ""),
        "image": request.data.get("icon", ""),
        "description": request.data.get("description", ""),
    }

    serializer = BadgeSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
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
    summary="Search courses",
    description="Search for courses by title. Only returns courses the user has access to.",
    parameters=[
        OpenApiParameter(
            name="course_prefix",
            description="The start of the course title",
            required=False,
            type=str,
        ),
    ],
    responses={
        200: CourseSerializer(many=True),
    },
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def search_courses(request):
    user = request.user
    searchQuery = request.query_params.get("course_prefix", "")

    viewable_courses_qs = Course.objects.filter_by_user_access(
        user
    ).user_progress_percent(user)

    if not viewable_courses_qs.exists():
        # permissiondenied also gives HTTP 403
        raise PermissionDenied("You do not have permission to view any courses.")

    viewable_courses_qs = viewable_courses_qs.filter(title__istartswith=searchQuery)

    serializer = CourseSerializer(
        viewable_courses_qs, many=True, context={"request": request}
    )

    return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(
    tags=["Courses"],
    summary="Create a new course",
    description="Creates a course and assigns the current user as creator. The authenticated user is automatically set as the course creator.",
    request=inline_serializer(
        name="CreateCourseRequest",
        fields={
            "title": serializers.CharField(),
            "description": serializers.CharField(),
        },
    ),
    responses={
        201: CourseSerializer(),
        400: OpenApiResponse(description="Serializer Failed."),
    },
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_course(request):
    serializer = CourseSerializer(data=request.data)
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
    responses={
        200: inline_serializer(
            name="GetCourseProgressResponse",
            fields={
                "course_id": serializers.IntegerField(),
                "title": serializers.CharField(),
                "progress_percent": serializers.FloatField(),
                "completed_tasks": serializers.IntegerField(),
                "total_tasks": serializers.IntegerField(),
            },
        ),
        204: OpenApiResponse(
            description="No courses found. Maybe check user permissions."
        ),
    },
)
@api_view(["GET"])
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


@extend_schema(
    tags=["Courses"],
    summary="Get all courses",
    description="Returns course and progress information for all courses the user can access.",
    responses={
        200: inline_serializer(
            name="GetAllCourseProgressResponse",
            many=True,
            fields={
                "course_id": serializers.IntegerField,
                "title": serializers.CharField,
                "description": serializers.CharField,
                "metadata": serializers.JSONField,
                "visibility": serializers.CharField,
                "is_published": serializers.BooleanField,
                "creator": serializers.StringRelatedField,
                "created_on": serializers.DateTimeField,
                "image": serializers.ImageField,
                "badge": BadgeSerializer,
                "progress_percent": serializers.FloatField(),
                "completed_tasks": serializers.IntegerField(),
                "total_tasks": serializers.IntegerField(),
            },
        ),
        204: OpenApiResponse(
            description="No courses found. Maybe check user permissions."
        ),
    },
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_courses(request):
    user = request.user

    # Only courses the user can access
    qs = Course.objects.filter_by_user_access(user).user_progress_percent(user)

    # Only get courses that have at least some progress
    qs = qs.filter(progress_percent__gt=0)

    if not qs.exists():
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = CourseSerializer(qs, many=True)

    results = []
    for serialized, course in zip(serializer.data, qs):
        results.append(
            {
                **serialized,
                "progress_percent": round(course.progress_percent or 0, 2),
                "completed_tasks": course.completed_tasks,
                "total_tasks": course.total_tasks,
            }
        )

    return Response(results, status=status.HTTP_200_OK)


@extend_schema(
    tags=["Courses"],
    summary="Get a specific course",
    description="Retrieves details and progress for a specific course ID. Returns a single object.",
    responses={
        200: inline_serializer(
            name="GetSingleCourseResponse",
            # many=False is the default, so we return one object {}
            fields={
                "id": serializers.IntegerField(),
                "title": serializers.CharField(),
                "description": serializers.CharField(),
                "metadata": serializers.JSONField(),
                "visibility": serializers.CharField(),
                "is_published": serializers.BooleanField(),
                "creator": serializers.StringRelatedField(),
                "created_on": serializers.DateTimeField(),
                "image": serializers.ImageField(),
                "badge": BadgeSerializer(),
                # These are the custom fields you manually added
                "progress_percent": serializers.FloatField(),
                "completed_tasks": serializers.IntegerField(),
                "total_tasks": serializers.IntegerField(),
            },
        ),
        404: OpenApiResponse(description="Course not found or access denied."),
    },
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_course(request, course_id):
    user = request.user

    # Only courses the user can access
    qs = (
        Course.objects.filter_by_user_access(user)
        .user_progress_percent(user)
        .filter(id=course_id)
    )

    course = qs.first()

    if not course:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = CourseSerializer(course, context={"request": request})

    result = {
        **serializer.data,
        "progress_percent": round(course.progress_percent or 0, 2),
        "completed_tasks": course.completed_tasks,
        "total_tasks": course.total_tasks,
    }

    return Response(result, status=status.HTTP_200_OK)


# -------------------------------
# Section-related API calls
# -------------------------------
@extend_schema(
    tags=["Sections"],
    summary="Delete a section",
    description="Deletes a section and everything that that section contains: rooms/etc..",
    responses={
        204: OpenApiResponse(description="Section deleted successfully."),
        403: OpenApiResponse(
            description="You do not have permission to delete this section."
        ),
        404: OpenApiResponse(description="Could not get section."),
    },
)
@api_view(["DELETE"])
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
    summary="Get all sections",
    description="Returns sections and progress information for all sections the user can access.",
    request=None,
    responses={
        200: inline_serializer(
            name="GetAllSectionProgressResponse",
            many=True,
            fields={
                "course_id": serializers.IntegerField,
                "section_id": serializers.IntegerField,
                "title": serializers.CharField,
                "description": serializers.CharField,
                "metadata": serializers.JSONField,
                "visibility": serializers.CharField,
                "is_published": serializers.BooleanField,
                "creator": serializers.StringRelatedField,
                "created_on": serializers.DateTimeField,
                "image": serializers.ImageField,
                "badge": BadgeSerializer,
                "progress_percent": serializers.FloatField(),
                "completed_tasks": serializers.IntegerField(),
                "total_tasks": serializers.IntegerField(),
            },
        ),
        204: OpenApiResponse(
            description="No sections found. Maybe check user permissions."
        ),
    },
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_sections(request, course_id):
    user = request.user
    get_object_or_404(Course, id=course_id)

    viewable_sections_qs = (
        Section.objects.filter(course_id=course_id)
        .filter_by_user_access(user)
        .user_progress_percent(user)
    )

    if not viewable_sections_qs.exists():
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = SectionSerializer(viewable_sections_qs, many=True)

    results = []
    for serialized, section in zip(serializer.data, viewable_sections_qs):
        results.append(
            {
                **serialized,
                "progress_percent": round(section.progress_percent or 0, 2),
                "completed_tasks": section.completed_tasks,
                "total_tasks": section.total_tasks,
            }
        )

    return Response(results, status=status.HTTP_200_OK)


@extend_schema(
    tags=["Sections"],
    summary="Get all sections",
    description="Returns sections and progress information for all sections the user can access.",
    request=None,
    responses={
        200: inline_serializer(
            name="GetAllSectionProgressResponse",
            many=True,
            fields={
                "course_id": serializers.IntegerField,
                "section_id": serializers.IntegerField,
                "title": serializers.CharField,
                "description": serializers.CharField,
                "metadata": serializers.JSONField,
                "visibility": serializers.CharField,
                "is_published": serializers.BooleanField,
                "creator": serializers.StringRelatedField,
                "created_on": serializers.DateTimeField,
                "image": serializers.ImageField,
                "badge": BadgeSerializer,
                "progress_percent": serializers.FloatField(),
                "completed_tasks": serializers.IntegerField(),
                "total_tasks": serializers.IntegerField(),
            },
        ),
        204: OpenApiResponse(
            description="No sections found. Maybe check user permissions."
        ),
    },
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_sections_by_title(request, course_title):
    user = request.user
    course = get_object_or_404(Course, title=course_title)

    viewable_sections_qs = (
        Section.objects.filter(course_id=course.id)
        .filter_by_user_access(user)
        .user_progress_percent(user)
    )

    if not viewable_sections_qs.exists():
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = SectionSerializer(viewable_sections_qs, many=True)

    results = []
    for serialized, section in zip(serializer.data, viewable_sections_qs):
        results.append(
            {
                **serialized,
                "progress_percent": round(section.progress_percent or 0, 2),
                "completed_tasks": section.completed_tasks,
                "total_tasks": section.total_tasks,
            }
        )

    return Response(results, status=status.HTTP_200_OK)


@extend_schema(
    tags=["Sections"],
    summary="Create a new section",
    description="Creates a section and assigns the current user as creator. The authenticated user is automatically set as the section creator.",
    request=inline_serializer(
        name="CreateSectionRequest",
        fields={
            "title": serializers.CharField(),
            "description": serializers.CharField(),
        },
    ),
    responses={
        201: SectionSerializer(),
        404: OpenApiResponse(
            description="Could not get course that the section is in."
        ),
        400: OpenApiResponse(description="Serializer Failed."),
    },
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_section(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    serializer = SectionSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(
            course=course,
            creator=request.user,
            metadata={},
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=["Sections"],
    summary="Get section progress",
    description="Get the total progress of the section as a percentage.",
    responses={
        200: inline_serializer(
            name="GetSectionProgressResponse",
            fields={
                "section_id": serializers.IntegerField(),
                "title": serializers.CharField(),
                "progress_percent": serializers.FloatField(),
                "completed_tasks": serializers.IntegerField(),
                "total_tasks": serializers.IntegerField(),
            },
        ),
        204: OpenApiResponse(
            description="No section found. Maybe check user permissions."
        ),
    },
)
@api_view(["GET"])
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
    responses={
        204: OpenApiResponse(description="Room deleted successfully."),
        403: OpenApiResponse(
            description="You do not have permission to delete this room."
        ),
        404: OpenApiResponse(description="Could not get room."),
    },
)
@api_view(["DELETE"])
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
    responses={
        200: RoomSerializer(),
        403: OpenApiResponse(
            description="You do not have permission to view any rooms."
        ),
        404: OpenApiResponse(
            description="Could not get course or section that the room is in."
        ),
    },
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_rooms(request, section_id):
    user = request.user
    get_object_or_404(Section, id=section_id)

    viewable_rooms_qs = (
        Room.objects.filter(section_id=section_id)
        .filter_by_user_access(user)
        .user_progress_percent(user)
    )

    if not viewable_rooms_qs.exists():
        raise PermissionDenied("You do not have permission to view any rooms.")

    serializer = RoomSerializer(
        viewable_rooms_qs, many=True, context={"request": request}
    )
    return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(
    tags=["Rooms"],
    summary="Get all rooms",
    description="Returns rooms and progress information for all rooms the user can access.",
    request=None,
    responses={
        200: inline_serializer(
            name="GetAllRoomProgressResponse",
            many=True,
            fields={
                "course_id": serializers.IntegerField,
                "section_id": serializers.IntegerField,
                "room_id": serializers.IntegerField,
                "title": serializers.CharField,
                "description": serializers.CharField,
                "metadata": serializers.JSONField,
                "visibility": serializers.CharField,
                "is_published": serializers.BooleanField,
                "creator": serializers.StringRelatedField,
                "created_on": serializers.DateTimeField,
                "image": serializers.ImageField,
                "badge": BadgeSerializer,
                "progress_percent": serializers.FloatField,
                "completed_tasks": serializers.IntegerField,
                "total_tasks": serializers.IntegerField,
            },
        ),
        204: OpenApiResponse(
            description="No rooms found. Maybe check user permissions."
        ),
    },
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_rooms(request, section_id):
    user = request.user
    get_object_or_404(Section, id=section_id)

    viewable_rooms_qs = (
        Room.objects.filter(section_id=section_id)
        .filter_by_user_access(user)
        .user_progress_percent(user)
    )

    if not viewable_rooms_qs.exists():
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = RoomSerializer(viewable_rooms_qs, many=True)

    results = []
    for serialized, room in zip(serializer.data, viewable_rooms_qs):
        results.append(
            {
                **serialized,
                "progress_percent": round(room.progress_percent or 0, 2),
                "completed_tasks": room.completed_tasks,
                "total_tasks": room.total_tasks,
            }
        )

    return Response(results, status=status.HTTP_200_OK)


@extend_schema(
    tags=["Rooms"],
    summary="Get all rooms",
    description="Returns rooms and progress information for all rooms the user can access.",
    request=None,
    responses={
        200: inline_serializer(
            name="GetAllRoomProgressResponse",
            many=True,
            fields={
                "course_id": serializers.IntegerField,
                "section_id": serializers.IntegerField,
                "room_id": serializers.IntegerField,
                "title": serializers.CharField,
                "description": serializers.CharField,
                "metadata": serializers.JSONField,
                "visibility": serializers.CharField,
                "is_published": serializers.BooleanField,
                "creator": serializers.StringRelatedField,
                "created_on": serializers.DateTimeField,
                "image": serializers.ImageField,
                "badge": BadgeSerializer,
                "progress_percent": serializers.FloatField,
                "completed_tasks": serializers.IntegerField,
                "total_tasks": serializers.IntegerField,
            },
        ),
        204: OpenApiResponse(
            description="No rooms found. Maybe check user permissions."
        ),
    },
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_rooms_by_title(request, section_title):
    user = request.user
    section = get_object_or_404(Section, title=section_title)

    viewable_rooms_qs = (
        Room.objects.filter(section_id=section.id)
        .filter_by_user_access(user)
        .user_progress_percent(user)
    )

    if not viewable_rooms_qs.exists():
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = RoomSerializer(viewable_rooms_qs, many=True)

    results = []
    for serialized, room in zip(serializer.data, viewable_rooms_qs):
        results.append(
            {
                **serialized,
                "progress_percent": round(room.progress_percent or 0, 2),
                "completed_tasks": room.completed_tasks,
                "total_tasks": room.total_tasks,
            }
        )

    return Response(results, status=status.HTTP_200_OK)


@extend_schema(
    tags=["Rooms"],
    summary="Create a new room",
    description="Creates a room and assigns the current user as creator. The authenticated user is automatically set as the room creator.",
    request=inline_serializer(
        name="CreateRoomRequest",
        fields={
            "title": serializers.CharField(),
            "description": serializers.CharField(),
        },
    ),
    responses={
        201: RoomSerializer(),
        404: OpenApiResponse(
            description="Could not get course or section that the room is in."
        ),
        400: OpenApiResponse(description="Serializer Failed."),
    },
)
@api_view(["POST"])
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
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=["Rooms"],
    summary="Get room progress",
    description="Get the total progress of the room as a percentage.",
    responses={
        200: inline_serializer(
            name="GetRoomProgressResponse",
            fields={
                "room_id": serializers.IntegerField(),
                "title": serializers.CharField(),
                "progress_percent": serializers.FloatField(),
                "completed_tasks": serializers.IntegerField(),
                "total_tasks": serializers.IntegerField(),
            },
        ),
        204: OpenApiResponse(
            description="No room found. Maybe check user permissions."
        ),
    },
)
@api_view(["GET"])
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
            status=status.HTTP_404_NOT_FOUND,
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
    responses={
        200: RoomSerializer(),
        403: OpenApiResponse(
            description="You do not have permission to view this room."
        ),
        404: OpenApiResponse(description="Could not get room."),
    },
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_room(request, room_id):
    room = get_object_or_404(Room, id=room_id)

    if not user_has_access(room, request.user, edit=False):
        raise PermissionDenied("You do not have permission to view this room.")

    serializer = RoomSerializer(room, context={"request": request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(
    tags=["Rooms"],
    summary="Save a room",
    description="Overwrites an existing room (and its nested components) with new data. Validation and save are atomic. Removed components are cascade-deleted.",
    request=None,
    responses={
        200: OpenApiResponse(description="Room saved successfully."),
        400: OpenApiResponse(description="Serializer Failed."),
        403: OpenApiResponse(
            description="You do not have permission to edit this room."
        ),
        404: OpenApiResponse(description="Could not get room."),
    },
)
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def save_room(request, room_id):
    # Fetch the room instance
    room = get_object_or_404(Room, id=room_id)

    if not user_has_access(room, request.user, edit=True):
        raise PermissionDenied("You do not have permission to edit this room.")

    with transaction.atomic():
        for field, value in request.data.items():

            if field == "tasks":
                # Parse tasks JSON
                try:
                    tasks_list = json.loads(value) if isinstance(value, str) else value
                except json.JSONDecodeError:
                    return Response({"error": "Invalid tasks JSON"}, status=400)

                # Loop through each incoming task
                for task_data in tasks_list:
                    task_id = task_data.get("task_id")
                    tags = task_data.get("tags", [])
                    components = task_data.get("components", [])

                    # Fetch existing task or create a new one
                    if task_id:
                        task_obj, created = Task.objects.get_or_create(
                            id=task_id, defaults={"room": room}
                        )
                    else:
                        task_obj = Task.objects.create(room=room)
                        created = True

                    # Ensure task belongs to this room
                    task_obj.room = room

                    # Handle tags
                    if isinstance(task_obj.tags, list):  # JSONField
                        task_obj.tags = tags
                    else:  # ManyToManyField
                        tag_objs = []
                        for tag_name in tags:
                            tag_obj, _ = Tag.objects.get_or_create(name=tag_name)
                            tag_objs.append(tag_obj)
                        task_obj.tags.set(tag_objs)

                    task_obj.save()

                    # Process components individually (update existing, create new)
                    for comp in components:
                        comp_id = comp.get("task_component_id")
                        defaults = {
                            "type": comp.get("type"),
                            "content": comp.get("content") or "",
                        }

                        if comp_id:
                            # Try to update existing component
                            updated_count = TaskComponent.objects.filter(
                                id=comp_id, task=task_obj
                            ).update(**defaults)
                            if updated_count == 0:
                                # Component ID not found, create new
                                TaskComponent.objects.create(task=task_obj, **defaults)
                        else:
                            # Create new component if no ID
                            TaskComponent.objects.create(task=task_obj, **defaults)
            else:
                # Save normal room fields
                setattr(room, field, value)

        # Save room after loop
        room.save()

    return Response({"detail": "Room updated successfully"}, status=200)


@extend_schema(
    tags=["Rooms"],
    summary="Publish a room",
    description="Validates and publishes a room, making it publicly visible. A room must contain at least one task before publishing. Visibility is set to PUBLIC.",
    request=None,
    responses={
        200: OpenApiResponse(description="Room published successfully."),
        400: OpenApiResponse(description="Serializer Failed."),
        403: OpenApiResponse(
            description="You do not have permission to edit this room."
        ),
        404: OpenApiResponse(description="Could not get room."),
        406: OpenApiResponse(
            description="You must have at least one task before publishing."
        ),
    },
)
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def publish_room(request, room_id):
    room = get_object_or_404(Room, id=room_id)
    if not room.tasks.exists():
        return Response(status=status.HTTP_406_NOT_ACCEPTABLE)

    # publish, update visibility and is_published
    room.visibility = VisibilityLevel.PUBLIC
    room.is_published = True
    room.can_edit = False
    room.save(update_fields=["visibility", "can_edit", "is_published"])

    return Response(status=status.HTTP_200_OK)


# -------------------------------
# Contribution-related API calls
# -------------------------------
@extend_schema(
    tags=["Contribution"],
    summary="Add user(s) as course admin",
    description="Creates multiple UserCourseAccessLevel objects with AccessLevel=EDITOR.",
    request=inline_serializer(
        name="AddCourseAdminRequest",
        fields={
            "usernames": serializers.ListField(
                child=serializers.CharField(), help_text="A list of usernames to add."
            )
        },
    ),
    responses={
        201: OpenApiResponse(description="Added users successfully."),
        207: OpenApiResponse(
            description="Some users were found and access levels created successfully, some were not."
        ),
        404: OpenApiResponse(
            description="One or more users not found, or course not found."
        ),
        409: OpenApiResponse(
            description="Cannot create access level for public course."
        ),
        400: OpenApiResponse(description="Usernames must be a non-empty list."),
    },
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_course_editors(request, course_id):
    # Validate request data
    usernames = request.data.get("usernames", [])
    if not isinstance(usernames, list) or not usernames:
        return Response(
            {"detail": "usernames must be a non-empty list."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # 1. Validate Course (Corrected: fetch Course instead of Room)
    course = get_object_or_404(Course, id=course_id)

    # Use the model's VisibilityLevel constants
    if course.visibility == "PUB":  # Assuming 'PUB' is VisibilityLevel.PUBLIC
        return Response(
            {"message": "Cannot manually assign access level for public course."},
            status=status.HTTP_409_CONFLICT,
        )

    created_access_records = []
    missing_users = []

    for username in usernames:
        user = User.objects.filter(username=username).first()

        if not user:
            missing_users.append(username)
            continue

        # 2. COURSE LEVEL: Simplified logic using update_or_create (single DB operation)
        # This creates a new record if one doesn't exist, or updates the existing one.
        # This replaces the UserCourseAccessLevel.objects.filter(...).delete() + .create()
        user_course_access, created = UserCourseAccessLevel.objects.update_or_create(
            user=user,
            course=course,
            defaults={"access_level": "EDITOR"},  # Set access_level to EDITOR
        )

        # 3. Use the correct serializer
        created_access_records.append(
            UserCourseAccessLevelSerializer(user_course_access).data
        )

    # --- Response Handling ---
    if missing_users:
        return Response(
            {
                "created": created_access_records,
                "missing_users": missing_users,
                "message": "Access levels for some users were updated/created successfully, while others were not found.",
            },
            status=status.HTTP_207_MULTI_STATUS,
        )

    # All users processed successfully
    return Response(created_access_records, status=status.HTTP_201_CREATED)


@extend_schema(
    tags=["Contribution"],
    summary="Get course editors",
    description="Retrieves a list of all users who have 'EDITOR' access to this course.",
    responses={
        200: UserCourseAccessLevelSerializer(many=True),
        403: OpenApiResponse(
            description="You do not have permission to view editors for this course."
        ),
        404: OpenApiResponse(description="Course not found."),
    },
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_course_editors(request, course_id):
    course = get_object_or_404(Course, id=course_id)

    # Security Check: Only people who can edit the course (creators/editors)
    # should be able to see the list of other editors.
    if not user_has_access(course, request.user, edit=True):
        raise PermissionDenied(
            "You do not have permission to view editors for this course."
        )

    # Query for all access levels for this course that are 'EDITOR'
    # select_related('user') is used to optimize the database query
    editors_access = UserCourseAccessLevel.objects.filter(
        course=course, access_level="EDITOR"
    ).select_related("user")

    serializer = UserCourseAccessLevelSerializer(editors_access, many=True)

    return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(
    tags=["Contribution"],
    summary="Remove course editor(s)",
    description="Removes 'EDITOR' access for a list of users. Accepts a JSON body with a list of usernames.",
    request=inline_serializer(
        name="RemoveCourseEditorRequest",
        fields={
            "usernames": serializers.ListField(
                child=serializers.CharField(),
                help_text="A list of usernames to remove.",
            )
        },
    ),
    responses={
        200: OpenApiResponse(
            description="All requested users were removed successfully."
        ),
        207: OpenApiResponse(
            description="Some users were removed, others were not found or were not editors."
        ),
        400: OpenApiResponse(description="Invalid input (e.g. empty list)."),
        403: OpenApiResponse(description="Permission denied."),
        404: OpenApiResponse(description="Course not found."),
    },
)
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_course_editors(request, course_id):
    # 1. Validate Input
    usernames = request.data.get("usernames", [])
    if not isinstance(usernames, list) or not usernames:
        return Response(
            {"detail": "usernames must be a non-empty list."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # 2. Get Course & Check Permissions
    course = get_object_or_404(Course, id=course_id)

    # Only existing editors/creators can remove others
    if not user_has_access(course, request.user, edit=True):
        raise PermissionDenied("You do not have permission to manage editors.")

    # 3. Process Removals
    removed_users = []
    missing_users = []
    not_editors = []
    cannot_remove = []  # For the creator

    for username in usernames:
        user = User.objects.filter(username=username).first()

        # Case A: User doesn't exist
        if not user:
            missing_users.append(username)
            continue

        # Case B: User is the Course Creator (Protected)
        if user == course.creator:
            cannot_remove.append(username)
            continue

        # Case C: Try to delete
        # We filter by user, course, AND access_level='EDITOR'
        # to ensure we don't accidentally remove a different permission type
        deleted_count, _ = UserCourseAccessLevel.objects.filter(
            course=course, user=user, access_level="EDITOR"
        ).delete()

        if deleted_count > 0:
            removed_users.append(username)
        else:
            # Case D: User existed, but wasn't an editor
            not_editors.append(username)

    # 4. Construct Response
    response_data = {
        "removed": removed_users,
        "missing_users": missing_users,
        "not_editors": not_editors,
        "cannot_remove": cannot_remove,
    }

    # If there were any "failures" (missing, not editors, or creators), return 207 Multi-Status
    if missing_users or not_editors or cannot_remove:
        return Response(response_data, status=status.HTTP_207_MULTI_STATUS)

    # Otherwise, clean 200 OK
    return Response(response_data, status=status.HTTP_200_OK)
