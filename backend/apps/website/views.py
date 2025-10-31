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
    '''
    create_room: Creates a new room for a specific course and section.
    @NOTE: The authenticated user is automatically set as the room creator.
    @request:
        {
            "title": "Room Title",
            "description": "Optional description of the room"
        }
    @path params:
        course_id: ID of the course to which the room belongs
        section_id: ID of the section under the course
    @return:
        * HTTP 201 with room details if creation succeeds:
            {
                "status": "success",
                "room_id": <int>,
                "creator_id": <int>,
                "creator_username": <str>
            }
        * HTTP 400 if validation fails (serializer errors)
    '''
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
    '''
    get_room: Retrieves the full editable room data for a given room.
    @NOTE: Users with only view permissions can see the room but not modify or publish it.
    @path params:
        course_id: ID of the course the room belongs to
        section_id: ID of the section the room belongs to
        room_id: ID of the room to retrieve
    @return:
        * HTTP 200 with serialized room data if the user has view access
        * HTTP 403 if the user does not have permission to view the room
        * HTTP 404 if the room, course, or section is not found
    '''
    room = get_object_or_404(Room, id=room_id, section_id=section_id, course_id=course_id)
    serializer = RoomSerializer(room, context={"request": request})

    # Only require view-level access (edit=False)
    if not serializer._user_has_access(room, request.user, edit=False):
        raise PermissionDenied("You do not have permission to view this room.")

    return Response(serializer.data)


# helper for reuse in save and publish
def _save_room_logic(request, course_id, section_id, room_id):
    '''
    _save_room_logic: Internal helper to handle validation and saving of a room
    (including nested tasks and components) within a single transaction.
    @NOTE: Used by both `save_room` and `publish_room`.
    @request: Expects Full room JSON structure (see note at bottom) in request.data for overwrite.
    @return:
        (room, None) if validation and save succeed,
        (None, errors) if serializer validation fails.
    '''
    room = get_object_or_404(Room, id=room_id, section_id=section_id, course_id=course_id)
    serializer = RoomSerializer(room, data=request.data, context={"request": request})
    print("serializer is vali", serializer.is_valid())
    if serializer.is_valid():
        with transaction.atomic():
            return serializer.save(), None
    return None, serializer.errors


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_room(request, course_id, section_id, room_id):
    '''
    save_room: Overwrites an existing room (and its nested tasks/components) with new data.
    @NOTE:
        * Performs full validation before saving.
        * Deletes any removed tasks/components via cascade.
        * Uses `_save_room_logic` to ensure atomic save.
    @request:
        Full room JSON structure (see note at bottom) with updated fields.
    @path params:
        course_id: ID of the parent course
        section_id: ID of the parent section
        room_id: ID of the room being updated
    @return:
        * HTTP 200 if room saved successfully
            {
                "status": "success",
                "room_id": <int>,
                "message": "Room saved successfully."
            }
        * HTTP 400 if serializer validation fails
    '''
    room, errors = _save_room_logic(request, course_id, section_id, room_id)
    print("error are : ", errors)
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
    '''
    publish_room: Validates and publishes a room, making it publicly visible.
    @NOTE:
        * First performs a save/update using `_save_room_logic`.
        * Ensures the room has at least one task before publishing.
        * Sets visibility to PUBLIC and marks `is_published=True`.
    @request:
        Full room JSON structure (see note at bottom) to validate and publish.
    @path params:
        course_id: ID of the parent course
        section_id: ID of the parent section
        room_id: ID of the room to publish
    @return:
        * HTTP 200 if publish succeeds:
            {
                "status": "success",
                "room_id": <int>,
                "published": True,
                "message": "Room published successfully."
            }
        * HTTP 400 if:
            - Validation fails
            - The room has no tasks
            - Serializer errors occur
    '''
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
      "point_value": 10,
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
      "point_value": 5,
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