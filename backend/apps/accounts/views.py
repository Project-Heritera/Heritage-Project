from django.shortcuts import get_object_or_404, render
from django.contrib.auth import authenticate, get_user_model, login, logout
from django.contrib import messages
from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import OpenApiResponse, extend_schema, OpenApiExample, inline_serializer

from apps.website.models import Course
from .serializer import UserSerializer

User = get_user_model()

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
            name="GetUserInfoResponse",
            fields={
                "user_id": serializers.IntegerField(),
                "username": serializers.CharField(),
                "profile_pic": serializers.ImageField(),
                "description": serializers.CharField(),
                "courses_created": serializers.IntegerField(),
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

    
    responses={
        200: inline_serializer(
            name="GetUserInfoResponse",
            fields={
                "user_id": serializers.IntegerField(),
                "username": serializers.CharField(),
                "profile_pic": serializers.ImageField(),
                "description": serializers.CharField(),
                "courses_created": serializers.IntegerField(),
            }
        ),
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    user = request.user

    courses_created_int = Course.objects.filter(creator=user).count()

    user_serializer = UserSerializer(user)

    return Response({
        **user_serializer.data,
        "courses_created": courses_created_int
    }, status=status.HTTP_200_OK)


@extend_schema(
    tags=["Users"],
    summary="Get another user's info",
    description="Gets the information of another user (not the one logged in). You must provide the user's ID in the url.",
    
    
    responses={
        200: inline_serializer(
            name="GetAnotherUserInfoResponse",
            fields={
                "user_id": serializers.IntegerField(),
                "username": serializers.CharField(),
                "profile_pic": serializers.ImageField(),
                "description": serializers.CharField(),
                "courses_created": serializers.IntegerField(),
            }
        ),
        404: OpenApiResponse(description='Could not get user.'),
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_another_user_info(request, user_id):
    user = get_object_or_404(User, id=user_id)

    courses_created_int = Course.objects.filter(creator=user).count()

    serializer = UserSerializer(user)

    return Response({
        **serializer.data,
        "courses_created": courses_created_int
    }, status=status.HTTP_200_OK)
