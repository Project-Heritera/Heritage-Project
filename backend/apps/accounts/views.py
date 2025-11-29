from django.shortcuts import get_object_or_404, render
from django.contrib.auth import authenticate, get_user_model, login, logout
from django.contrib import messages
from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import OpenApiResponse, extend_schema, OpenApiExample, inline_serializer

from apps.website.models import Course
from friendship.models import Block, Friend, FriendshipRequest
from apps.website.serializers import CourseSerializer
from .serializer import FriendshipRequestSerializer, UserSerializer
from friendship.models import Friend, Follow, Block, FriendshipRequest
from friendship.exceptions import AlreadyExistsError

User = get_user_model()

# -------------------------------
# User-related API calls
# -------------------------------
@extend_schema(
    tags=["Users"],
    summary="Get all users.",
    description="Get a json of all users ids and usernames.",
    request=None,
    responses={
        200: OpenApiResponse(description='Got all users.'),
    }
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def all_users(request):
    users = User.objects.all()
    data = [{"id": u.id, "username": u.username} for u in users]
    return Response(data, status=status.HTTP_200_OK)


@extend_schema(
    tags=["Users"],
    summary="Create a new user.",
    description="Creates a new user account in the database. Uses SignupSerializer to validate, autohash, and save user credentials.",
    request=inline_serializer(
        name="SignupRequest",
        fields={
            "username": serializers.CharField(),
            "email": serializers.EmailField(),
            "password": serializers.CharField()
        }
    ),
    responses={
        201: OpenApiResponse(description='User has been created successfully.'),
        400: OpenApiResponse(description='Invalid username or password and/or serializer failed.'),
    }
)
@api_view(["POST"])
def signup_user(request):
    username = request.POST["username"]
    email = request.POST["email"]
    password = request.POST["password"]
    user = User.objects.create_user(username, email, password)
    if user:
        user.save()
        return Response({"message": "Signup Successful"}, status=status.HTTP_201_CREATED)
    else:
        return Response("Invalid username or password", status=status.HTTP_401_UNAUTHORIZED)
    

@extend_schema(
    tags=["Users"],
    summary="Delete the user's account",
    description="Deletes the currently authenticated user's account from the database.",
    responses={
        200: OpenApiResponse(description='User has been deleted successfully.'),
        400: OpenApiResponse(description='Unable to remove user. Check if user is authenticated.'),
    }
)
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
@extend_schema(request=None)
def delete_account(request):
    if request.user.is_authenticated:
        user = request.user
        username = user.username 
        logout(request)  
        user.delete()
        return Response({"message": f"User '{username}' has been deleted"}, status=status.HTTP_200_OK)
    else:
        return Response({"error": f"Unable to remove user"}, status=status.HTTP_400_BAD_REQUEST)

@extend_schema(
    tags=["Users"],
    summary="Update the user's info",
    description="Update the profile picture and the description of the currently logged in user.",
    request=UserSerializer(),
    responses={
        200: inline_serializer(
            name="UpdateUserInfoResponse",
            fields={
                "user_id": serializers.IntegerField(),
                "username": serializers.CharField(),
                "profile_pic": serializers.ImageField(),
                "description": serializers.CharField()
            }
        ),
    }
)
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user_info(request):
    user = request.user

    serializer = UserSerializer(
        user,
        data=request.data,
        partial=True  # allows updating only provided fields
    )

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=["Users"],
    summary="Get the user's info",
    description="Get the information of the currently logged in user.",
    request=None,    
    responses={
        200: inline_serializer(
            name="GetUserInfoResponse",
            fields={
                "user_id": serializers.IntegerField(),
                "username": serializers.CharField(),
                "profile_pic": serializers.ImageField(),
                "description": serializers.CharField(),
                "courses_created": serializers.IntegerField(),
                "courses_completed": serializers.IntegerField()
            }
        ),
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    user = request.user

    courses_created_int = Course.objects.filter(creator=user).count()
    courses_completed_int = Course.objects.filter(
        userprogress__user=user,
        userprogress__percent=100
    ).count()

    user_serializer = UserSerializer(user)

    return Response({
        **user_serializer.data,
        "courses_created": courses_created_int,
        "courses_completed": courses_completed_int
    }, status=status.HTTP_200_OK)


@extend_schema(
    tags=["Users"],
    summary="Get another user's info",
    description="Gets the information of another user (not the one logged in). You must provide the user's ID in the url.",
    request=None,
    responses={
        200: inline_serializer(
            name="GetAnotherUserInfoResponse",
            fields={
                "user_id": serializers.IntegerField(),
                "username": serializers.CharField(),
                "profile_pic": serializers.ImageField(),
                "description": serializers.CharField(),
                "courses_created": serializers.IntegerField(),
                "courses_completed": serializers.IntegerField()
            }
        ),
        404: OpenApiResponse(description='Could not get user.'),
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_another_user_info(request, user_username):
    user = get_object_or_404(User, username=user_username)

    courses_created_int = Course.objects.filter(creator=user).count()
    courses_completed_int = Course.objects \
        .filter_by_user_access(user) \
        .user_progress_percent(user) \
        .filter(progress_percent=100) \
        .count()

    serializer = UserSerializer(user)

    return Response({
        **serializer.data,
        "courses_created": courses_created_int,
        "courses_completed": courses_completed_int
    }, status=status.HTTP_200_OK)


@extend_schema(
    tags=["Users"],
    summary="Get courses completed details",
    description="Get all the standard serializer info about all of the courses completed by a certain user.",
    request=None,
    responses={
        200: CourseSerializer,
        204: OpenApiResponse(description='No completed courses found.'),
        404: OpenApiResponse(description="Could not get user.")
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_courses_completed(request, user_username):
    user = get_object_or_404(User, username=user_username)

    courses_completed = Course.objects \
        .filter_by_user_access(user) \
        .user_progress_percent(user) \
        .filter(progress_percent=100)

    if not courses_completed.exists():
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = CourseSerializer(courses_completed, many=True, context={"request": request})

    return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(
    tags=["Users"],
    summary="Get courses created details",
    description="Get all the standard serializer info about all of the courses created by a certain user.",
    request=None,
    responses={
        200: CourseSerializer,
        204: OpenApiResponse(description='No created courses found.'),
        404: OpenApiResponse(description="Could not get user.")
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_courses_created(request, user_username):
    user = get_object_or_404(User, username=user_username)

    courses_created = Course.objects.filter(creator=user)

    if not courses_created.exists():
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = CourseSerializer(courses_created, many=True, context={"request": request})

    return Response(serializer.data, status=status.HTTP_200_OK)


# # -------------------------------
# # Friends-related API calls
# # https://github.com/revsys/django-friendship/blob/main/friendship/urls.py
# # -------------------------------

# ================= FRIENDS =================

@extend_schema(
    tags=["Friends"],
    summary="Get friends",
    description="Get all the friends of a user.",
    request=None,
    responses={
        200: inline_serializer(
            name="ViewFriendsResponse",
            fields = {
                "user": UserSerializer,
                "friends": UserSerializer,
            }
        ),
        204: OpenApiResponse(description='User has no friends.'),
        404: OpenApiResponse(description="Could not get user.")
    }
)
@api_view(["GET"])
def view_friends(request, username):
    user = get_object_or_404(User, username=username)
    friends = Friend.objects.friends(user)
    if not friends:
        return Response({"message": "User has no friends"}, status=204)
    return Response({
        "user": UserSerializer(user).data,
        "friends": UserSerializer(friends, many=True).data
    }, status=200)


@extend_schema(
    tags=["Friends"],
    summary="Send request",
    description="Send a friend request to another user. Creates a friend relation.",
    request=None,
    responses={
        201: OpenApiResponse(description='Friend request sent successfully.'),
        400: OpenApiResponse(description='Users are already friends.'),
        404: OpenApiResponse(description="Could not get user.")
    }
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def friendship_add_friend(request, to_username):
    to_user = get_object_or_404(User, username=to_username)
    try:
        Friend.objects.add_friend(request.user, to_user)
    except AlreadyExistsError as e:
        return Response({"message": "Users are already friends"}, status=400)

    return Response({"message": "Friend request sent"}, status=201)


@extend_schema(
    tags=["Friends"],
    summary="List requests",
    description="Get a list of incoming friend requests.",
    request=None,
    responses={
        200: OpenApiResponse(description='Friend request sent successfully.'),
        204: OpenApiResponse(description='No friend requests exist.'),
        404: OpenApiResponse(description="Could not get user.")
    }
)
@extend_schema(tags=["Friends"], summary="List incoming friend requests")
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def friendship_request_list(request):
    requests = Friend.objects.requests(request.user)
    if not requests:
        return Response(status=204)
    return Response({
        "requests": [{
            "id": r.id,
            "from_user": UserSerializer(r.from_user).data,
            "to_user": UserSerializer(r.to_user).data
        } for r in requests]
    }, status=200)


@extend_schema(
    tags=["Friends"],
    summary="Accept request",
    description="Accept a friend request. Also deletes FriendshipRequest relation.",
    request=None,
    responses={
        200: OpenApiResponse(description='Friend request accepted successfully.'),
        404: OpenApiResponse(description="Could not get request.")
    }
)
@extend_schema(tags=["Friends"], summary="Accept friend request")
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def friendship_accept(request, friendship_request_id):
    f_request = get_object_or_404(
        request.user.friendship_requests_received,
        id=friendship_request_id
    )
    f_request.accept()
    return Response({"message": "Friend request accepted"}, status=200)


@extend_schema(
    tags=["Friends"],
    summary="Reject request",
    description="Reject a friend request. Does not delete the FriendshipRequest relation.",
    request=None,
    responses={
        200: OpenApiResponse(description='Friend request rejected successfully.'),
        404: OpenApiResponse(description="Could not get request.")
    }
)
@extend_schema(tags=["Friends"], summary="Reject friend request")
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def friendship_reject(request, friendship_request_id):
    f_request = get_object_or_404(
        request.user.friendship_requests_received,
        id=friendship_request_id
    )
    f_request.reject()
    return Response({"message": "Friend request rejected"}, status=200)


@extend_schema(
    tags=["Friends"],
    summary="Cancel request",
    description="Cancel a friend request sent by the logged in user. Deletes the FriendshipRequest relation.",
    request=None,
    responses={
        204: OpenApiResponse(description='Friend request cancelled successfully.'),
        404: OpenApiResponse(description="Could not get request.")
    }
)
@extend_schema(tags=["Friends"], summary="Cancel friend request")
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def friendship_cancel(request, friendship_request_id):
    f_request = get_object_or_404(
        request.user.friendship_requests_sent,
        id=friendship_request_id
    )
    f_request.cancel()
    return Response({"message": "Friend request cancelled"}, status=204)


@extend_schema(
    tags=["Friends"],
    summary="List rejected requests",
    description="List all rejected friend requests.",
    request=None,
    responses={
        200: FriendshipRequestSerializer,
        404: OpenApiResponse(description="Could not get request.")
    }
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def friendship_request_list_rejected(request):
    requests = FriendshipRequest.objects.filter(rejected__isnull=False)

    return Response({
        "rejected_requests": FriendshipRequestSerializer(requests, many=True)
    }, status=200)


@extend_schema(
    tags=["Friends"],
    summary="View details of a request",
    description="Get the serializer details of a friendship request.",
    request=None,
    responses={
        200: FriendshipRequestSerializer,
        404: OpenApiResponse(description="Could not get request.")
    }
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def friendship_requests_detail(request, friendship_request_id):
    r = get_object_or_404(FriendshipRequest, id=friendship_request_id)

    return Response(FriendshipRequestSerializer(r), status=200)


# ================= FOLLOW =================

@extend_schema(
    tags=["Follow"],
    summary="List followers.",
    description="Get all the followers of user given.",
    request=None,
    responses={
        200: OpenApiResponse(description="Got followers successfully."),
        204: OpenApiResponse(description="No followers."),
        404: OpenApiResponse(description="Could not get user.")
    }
)
@api_view(["GET"])
def followers(request, username):
    user = get_object_or_404(User, username=username)
    data = Follow.objects.followers(user)
    if not data:
        return Response({"message": "User has no followers."}, status=204)
    return Response({"followers": UserSerializer(data, many=True).data}, status=200)


@extend_schema(
    tags=["Follow"],
    summary="List following.",
    description="Get all the users following a user given.",
    request=None,
    responses={
        200: OpenApiResponse(description="Got following successfully."),
        204: OpenApiResponse(description="None following."),
        404: OpenApiResponse(description="Could not get user.")
    }
)
@api_view(["GET"])
def following(request, username):
    user = get_object_or_404(User, username=username)
    data = Follow.objects.following(user)
    if not data:
        return Response({"message": "User has no one following."}, status=204)
    return Response({"following": UserSerializer(data, many=True).data}, status=200)


@extend_schema(
    tags=["Follow"],
    summary="Follow a user.",
    description="Create a follow relation.",
    request=None,
    responses={
        200: OpenApiResponse(description="Following successfully."),
        400: OpenApiResponse(description="User is already following."),
        404: OpenApiResponse(description="Could not get follow.")
    }
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def follower_add(request, followee_username):
    followee = get_object_or_404(User, username=followee_username)
    try:
        Follow.objects.add_follower(request.user, followee)
    except AlreadyExistsError as e:
        return Response({"message": "User already is following."}, status=400)

    return Response({"message": "Now following user"}, status=201)


@extend_schema(
    tags=["Follow"],
    summary="Remove follow.",
    description="Remove a follow relation.",
    request=None,
    responses={
        204: OpenApiResponse(description="Removed follow successfully."),
        404: OpenApiResponse(description="Could not get follow.")
    }
)
@extend_schema(tags=["Follow"], summary="Unfollow a user")
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def follower_remove(request, followee_username):
    followee = get_object_or_404(User, username=followee_username)
    Follow.objects.remove_follower(request.user, followee)
    return Response({"message": "Unfollowed user"}, status=204)


# ================= BLOCK =================

@extend_schema(
    tags=["Block"],
    summary="List blocking.",
    description="Get all the users blocked by a user given.",
    request=None,
    responses={
        200: OpenApiResponse(description="Got blocking successfully."),
        204: OpenApiResponse(description="None blocking."),
        404: OpenApiResponse(description="Could not get user.")
    }
)
@api_view(["GET"])
def blocking(request, username):
    user = get_object_or_404(User, username=username)
    data = Block.objects.blocked(user)
    if not data:
        return Response({"message": "None blocking."}, status=204)
    return Response({"blocked": UserSerializer(data, many=True).data}, status=200)


@extend_schema(
    tags=["Block"],
    summary="List blockers.",
    description="Get all the users that block a user given.",
    request=None,
    responses={
        200: OpenApiResponse(description="Got blockers successfully."),
        204: OpenApiResponse(description="No blockers."),
        404: OpenApiResponse(description="Could not get user.")
    }
)
@api_view(["GET"])
def blockers(request, username):
    user = get_object_or_404(User, username=username)
    data = Block.objects.blocking(user)
    if not data:
        return Response({"message": "No blockers."}, status=204)
    return Response({"blockers": UserSerializer(data, many=True).data}, status=200)


@extend_schema(
    tags=["Block"],
    summary="Block user.",
    description="Block a user based on username given.",
    request=None,
    responses={
        200: OpenApiResponse(description="Blocked successfully."),
        400: OpenApiResponse(description="User is already blocked."),
        404: OpenApiResponse(description="Could not get user.")
    }
)
@extend_schema(tags=["Block"], summary="Block a user")
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def block_add(request, blocked_username):
    blocked = get_object_or_404(User, username=blocked_username)
    try:
        Block.objects.add_block(request.user, blocked)
    except AlreadyExistsError as e:
        return Response({"message": "User is already blocked."}, status=400)

    return Response({"message": "User blocked"}, status=201)


@extend_schema(
    tags=["Block"],
    summary="Unblock user.",
    description="Unblock a user based on username given.",
    request=None,
    responses={
        204: OpenApiResponse(description="Unblocked successfully."),
        404: OpenApiResponse(description="Could not get user or block.")
    }
)
@extend_schema(tags=["Block"], summary="Unblock a user")
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def block_remove(request, blocked_username):
    blocked = get_object_or_404(User, username=blocked_username)
    Block.objects.remove_block(request.user, blocked)
    return Response({"message": "User unblocked"}, status=204)

@extend_schema(
    tags=["Friends"],
    summary="List sent requests",
    description="Get a list of friend requests SENT by the logged-in user (outgoing pending requests).",
    request=None,
    responses={
        200: inline_serializer(
            name="PendingRequestsResponse",
            fields={
                "pending_users": serializers.ListField(
                    child=inline_serializer(
                        name="PendingRequestItem",
                        fields={
                            "User": UserSerializer(),
                            # If you decide to add 'request_id' later, add: 
                            # "request_id": serializers.IntegerField() 
                        }
                    )
                )
            }
        ),
        401: OpenApiResponse(description="Not authenticated")
    }
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def pending_friend_requests(request):
    requests = Friend.objects.sent_requests(user=request.user)

    if not requests:
        return Response({"pending_users": []}, status=200)
    
    return Response({
        "pending_users": [{
            "User": UserSerializer(r.to_user).data,
            "friendship_request_id": r.id,
        } for r in requests]
    }, status=200)