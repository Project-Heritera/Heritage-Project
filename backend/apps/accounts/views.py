from django.shortcuts import get_object_or_404, render
from django.contrib.auth import authenticate, get_user_model, login, logout
from django.contrib import messages
from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from drf_spectacular.utils import OpenApiResponse, extend_schema, OpenApiExample, inline_serializer, OpenApiParameter
from rest_framework_simplejwt.tokens import RefreshToken

from apps.website.models import Course
from friendship.models import Block, Friend, FriendshipRequest, cache
from apps.website.serializers import CourseSerializer
from .serializer import FriendshipRequestSerializer, LoginSerializer, UserSerializer, VerifyLoginMFARequest
from friendship.models import Friend, Follow, Block, FriendshipRequest
from friendship.exceptions import AlreadyExistsError
from django.core.signing import TimestampSigner, BadSignature, SignatureExpired

import pyotp
import qrcode
import base64
from io import BytesIO

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
    summary="Search users",
    description="Returns a list of users matching the query.",
    parameters=[
        OpenApiParameter(name="user_prefix", description="The search term", required=False, type=str),
    ],
    responses={
        200: UserSerializer(many=True), # Document that it returns the standard User object
    }
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def search_users(request):
    query = request.query_params.get('user_prefix', '')

    if query:
        users = User.objects.filter(username__istartswith=query)
    else:
        users = User.objects.none()
    
    serializer = UserSerializer(users, many=True, context={"request": request})

    return Response(serializer.data, status=status.HTTP_200_OK)


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
@permission_classes([AllowAny])
def signup_user(request):
    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")
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
    request=inline_serializer(
        name="UpdateUserInfoRequest",
        fields={
            "username": serializers.CharField(),
            "profile_pic": serializers.ImageField(),
            "description": serializers.CharField()
        }
    ),
    responses={
        200: UserSerializer,
        403: OpenApiResponse(description="Cannot update email or password using this view."),
        400: OpenApiResponse(description="Serializer failed.")
    }
)
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user_info(request):
    user = request.user

    if "email" in request.data or "password" in request.data:
        return Response(status=status.HTTP_403_FORBIDDEN)

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
    summary="Update the user's password or email info",
    description="Update the password or email of the currently logged in user. Only send 'code' if the user has MFA enabled.",
    request=inline_serializer(
        name="UpdateVitalUserInfoResponse",
        fields={
            "password": serializers.CharField(),
            "email": serializers.EmailField(),
            "code": serializers.IntegerField()
        }
    ),
    responses={
        200: UserSerializer,
        400: OpenApiResponse(description="Serializer failed."),
        403: OpenApiResponse(description="You must have MFA enabled to change your email or password.")
    }
)
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user_important_info(request):
    user = request.user

    if user.totp_secret: # mfa enabled
        totp = pyotp.TOTP(user.totp_secret) # get users secret

        if not totp.verify(request.data.get("code")): # get request code
            return Response({"error": "Invalid MFA code"}, status=401)

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
                "streak": serializers.IntegerField(),
                "longest_streak": serializers.IntegerField(),
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
                "streak": serializers.IntegerField(),
                "longest_streak": serializers.IntegerField(),
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

    existing_rejected = FriendshipRequest.objects.filter(
        from_user=request.user,
        to_user=to_user,
        rejected__isnull=False
    )
    if existing_rejected.exists():
        existing_rejected.delete()
        
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
    requests = FriendshipRequest.objects.filter(
        to_user=request.user, 
        rejected__isnull=True
    )
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
    requests = FriendshipRequest.objects.filter(
        from_user=request.user,
        rejected__isnull=True
    )

    if not requests:
        return Response({"pending_users": []}, status=200)
    
    return Response({
        "pending_users": [{
            "User": UserSerializer(r.to_user).data,
            "friendship_request_id": r.id,
        } for r in requests]
    }, status=200)

@extend_schema(
    tags=["Friends"],
    summary="Remove friend",
    description="Removes an existing friendship between the logged-in user and the specified user.",
    request=None,
    responses={
        200: OpenApiResponse(description='Friend removed successfully.'),
        400: OpenApiResponse(description='Users were not friends.'),
        404: OpenApiResponse(description="Could not find user.")
    }
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def remove_friend(request, username):
    other_user = get_object_or_404(User, username=username)

    if Friend.objects.remove_friend(request.user, other_user):
        return Response({"message": "Friend removed successfully"}, status=200)
    else:
        return Response({"message": "You are not friends with this user"}, status=400)


# -------------------------------
# 2FA-related API calls
# -------------------------------
@extend_schema(
    tags=["2FA"],
    summary="Send QR",
    description="Generates a MFA QR code.",
    request=None,
    responses={
        200: OpenApiResponse(inline_serializer(
            name="SendQRResponse",
            fields={
                "qr_code_base64": serializers.ImageField(),
                "secret": serializers.CharField,
                "otpauth_uri": serializers.CharField()
            }
        ), description='Sent code successfully.'
    )
    }
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def generate_mfa_qr(request):
    user = request.user

    totp_secret = pyotp.random_base32()

    totp_uri = pyotp.totp.TOTP(totp_secret).provisioning_uri(
        name=user.email,
        issuer_name="Vivan"
    )

    # Generate QR code
    qr = qrcode.make(totp_uri)
    buffer = BytesIO()
    qr.save(buffer, format="PNG")
    qr_base64 = base64.b64encode(buffer.getvalue()).decode()

    return Response({
        "secret": totp_secret,
        "qr_code_base64": qr_base64,
        "otpauth_uri": totp_uri
    }, status=200)


@extend_schema(
    tags=["2FA"],
    summary="Verify code",
    description="Check code if it's valid.",
    request=inline_serializer(
        name="VerifyCodeRequest",
        fields={
            "code": serializers.IntegerField(),
            "secret": serializers.CharField()
        }
    ),
    responses={
        200: OpenApiResponse(inline_serializer(
            name="VerifyMFA",
            fields={
                "success": serializers.BooleanField()
            }
        ), description='Successfully checked authentication.')
    }
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_mfa(request):
    code = request.data.get("code")  # user enters 6-digit number
    secret = request.data.get("secret")
    user = request.user

    totp = pyotp.TOTP(secret)

    if totp.verify(code):
        user.totp_secret = secret
        # Mark user as MFA enabled (optional)
        return Response({"success": True}, status=200)
    else:
        return Response({"success": False, "error": "Invalid code"}, status=200)


@extend_schema(
    tags=["2FA"],
    summary="Disable 2FA",
    description="Completely deletes all MFA data (TOTP secret, flags, backup codes).",
    request=None,
    responses={
        200: OpenApiResponse(inline_serializer(
            name="Disable2FAResponse",
            fields={
                "message": serializers.CharField()
            }
        ), 
        description='2FA removed successfully.'),
        400: OpenApiResponse(description="You must have MFA enabled to disable it.")
    }
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def disable_mfa(request):
    user = request.user

    if not user.totp_secret:
        return Response({"error": "You must have MFA enabled to disable it."}, status=status.HTTP_400_BAD_REQUEST)

    # Remove TOTP secret
    user.totp_secret = None

    # Optional: if your User model has a flag for 2FA
    if hasattr(user, "is_mfa_enabled"):
        user.is_mfa_enabled = False

    # Optional: if you store backup or recovery codes
    if hasattr(user, "backup_codes"):
        user.backup_codes = None  # or [] depending on your field definition

    user.save()

    return Response(
        {"message": "Two-factor authentication disabled and all MFA data has been removed."},
        status=200
    )


def rate_limit(key: str, limit: int, window_seconds: int):
    """
    Return True if limit exceeded, else False.
    Automatically expires after window.
    """
    attempts = cache.get(key, 0)

    if attempts >= limit:
        return True  # limit exceeded

    if attempts == 0:
        cache.set(key, 1, timeout=window_seconds)
    else:
        cache.incr(key)

    return False


@extend_schema( 
        tags=["2FA"], 
        summary="Login (Step 1)", 
        description="Checks username & password. Returns MFA requirement or full JWT tokens.", 
        request=LoginSerializer, 
        responses={ 
            201: OpenApiResponse(inline_serializer( 
                name="LoginStep1Response1", 
                fields={ "mfa_required": serializers.BooleanField(), 
                "access": serializers.CharField(), 
                "refresh": serializers.CharField() } ), 
                description="Login successful or MFA required."), 
            200: OpenApiResponse(inline_serializer( 
                name="LoginStep1Response2", 
                fields={ 
                    "mfa_required": serializers.BooleanField(), 
                    "ephemeral_token": serializers.CharField() 
                }
            )
        ) 
    } 
)
@api_view(["POST"])
@permission_classes([AllowAny])
def login_step1(request):
    username = request.data.get("username")
    password = request.data.get("password")

    # --------------------------
    # RATE LIMIT: 10 tries / 15 min
    # --------------------------
    client_ip = request.META.get("REMOTE_ADDR", "unknown")
    key = f"login1_{username}_{client_ip}"

    if rate_limit(key, limit=10, window_seconds=900):
        return Response(
            {"error": "Too many login attempts. Try again in 15 minutes."},
            status=429
        )
    # --------------------------

    user = authenticate(username=username, password=password)

    if user is None:
        return Response({"error": "Invalid username or password."}, status=400)

    # User has no MFA
    if not user.totp_secret:
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "mfa_required": False,
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            },
            status=201
        )

    # MFA required → create ephemeral token
    signer = TimestampSigner()
    ephemeral_token = signer.sign(user.id)

    return Response({
        "mfa_required": True,
        "ephemeral_token": ephemeral_token
    }, status=200)


@extend_schema(
    tags=["2FA"],
    summary="Login (Step 2)",
    description="Verify MFA code using the temporary token. Returns full JWT tokens.",
    request=VerifyLoginMFARequest, # Ensure this matches your serializer from the previous step
    responses={
        200: OpenApiResponse(inline_serializer(
            name="LoginStep2Response",
            fields={
                "mfa_success": serializers.BooleanField(), 
                "access": serializers.CharField(),
                "refresh": serializers.CharField()
            }
        ), description="MFA success and logged in."),
        400: OpenApiResponse(description="Invalid session or missing data."),
        401: OpenApiResponse(description="Invalid MFA Code."),
    },
)
@api_view(["POST"])
@permission_classes([AllowAny])
def login_step2(request):
    token = request.data.get("ephemeral_token")
    otp = request.data.get("otp")

    if not token or not otp:
        return Response({"error": "Missing ephemeral_token or otp"}, status=400)

    signer = TimestampSigner()
    User = get_user_model()

    try:
        user_id = signer.unsign(token, max_age=300)
        user = User.objects.get(id=user_id)
    except (BadSignature, SignatureExpired):
        return Response({"error": "Invalid or expired login session."}, status=400)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=404)

    # --------------------------
    # RATE LIMIT: 5 MFA tries / 15 min
    # --------------------------
    key = f"login2_mfa_{user.id}"

    if rate_limit(key, limit=5, window_seconds=900):
        return Response(
            {"error": "Too many MFA attempts. Try again in 15 minutes."},
            status=429
        )
    # --------------------------

    # Verify MFA
    if not user.totp_secret:
        return Response({"error": "User does not have MFA enabled"}, status=400)

    totp = pyotp.TOTP(user.totp_secret)

    if not totp.verify(otp):
        return Response({"error": "Invalid MFA code"}, status=401)

    # Success → reset attempt counter
    cache.delete(key)

    # Issue real tokens
    refresh = RefreshToken.for_user(user)
    return Response({
        "mfa_success": True,
        "access": str(refresh.access_token),
        "refresh": str(refresh)
    }, status=200)


@extend_schema(
    tags=["2FA"],
    summary="Check MFA enabled",
    description="Check if the user has MFA enabled or not.",
    request=None,
    responses={
        200: OpenApiResponse(inline_serializer(
            name="CheckMFAResponse",
            fields={
                "mfa_enabled": serializers.BooleanField(),
            }
        ), description="Got enabled bool."),
    },
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def check_mfa_enabled(request):
    user = request.user
    enabled = False
    if user.totp_secret:
        enabled = True
    
    return Response({"mfa_enabled": enabled}, status=200)