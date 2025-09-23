from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib import messages
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializer import UserSerializer
# Create your views here.

@api_view(["POST"])
def login_user(request):
    '''
    login_user: logs user into db given their username and password. Uses login from django.contrib.auth  
    @request: 
        {
            "username": "my_username",
            "password": "my_password123"
        }
        where identifier is the username of email
    @return: 
        * HTTP 202 if login succeeds
        * HTTP 401 if credentials are invalid
        * HTTP 400 with validation errors if request data is malformed
    '''

    username = request.POST["username"]
    password = request.POST["password"]
    user = authenticate(request, username=username, password=password)
    if user:
        login(request, user)
        return Response({"message": "Login Successful"}, status=status.HTTP_202_ACCEPTED)
    else:
        return Response("Invalid username or password", status=status.HTTP_401_UNAUTHORIZED)
        ...


@api_view(["POST"])
def logout_user(request):
    '''
    logout_user: Logs out the currently authenticated user. Uses `logout` from django.contrib.auth.
    @request: No request body is required.
    @NOTE: The request must be made with a valid authenticated session.
    @return:
        * HTTP 200 if logout succeeds
        * HTTP 400 if there is no active session
    '''
    if request.user.is_authenticated:
        logout(request)  
        return Response({"message": "Logout Successful"}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "No user is currently logged in"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
def signup_user(request):
    '''
    signup_user: Creates a new user account in the database. 
    @NOTE: Uses SignupSerializer to validate, autohash, and save user credentials.
    @request:
        {
            "username": "new_user123",
            "email": "new_user@example.com",
            "password": "securepassword"
        }
    @return:
        * HTTP 201 if the account was created
        * HTTP 400 with validation errors if username/email already exists
        or if request body fails serializer validation
    '''
    username = request.POST["username"]
    email = request.POST["email"]
    password = request.POST["password"]
    user = User.objects.create_user(username, email, password)
    if user:
        user.save()
        return Response({"message": "Signup Successful"}, status=status.HTTP_201_CREATED)
    else:
        return Response("Invalid username or password", status=status.HTTP_401_UNAUTHORIZED)
    

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_account(request):
    '''
    delete_account: Deletes the currently authenticated user's account from the database.
    @request:No request body required.
    @return:
        * HTTP 200 if deletion succeeds
        * HTTP 400 if deletion fails
    '''
    if request.user.is_authenticated:
        user = request.user
        username = user.username 
        logout(request)  
        user.delete()
        return Response({"message": f"User '{username}' has been deleted"}, status=status.HTTP_200_OK)
    else:
        return Response({"error": f"Unable to remove user"}, status=status.HTTP_400_BAD_REQUEST)
