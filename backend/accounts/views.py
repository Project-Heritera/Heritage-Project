from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializer import UserSerializer, SignupSerializer, ChangePasswordSerializer
# Create your views here.

@api_view(["Post"])
def login_user(request):
    '''
    login_user: logs user into db given their username and password. Uses login from django.contrib.auth  
    @request: 
        {
            "username": "my_username",
            "password": "my_password123"
        }
    @return: 
        * HTTP 202 if login succeeds
        * HTTP 401 if credentials are invalid
        * HTTP 400 with validation errors if request data is malformed
    '''
    serializer = UserSerializer(data=request.data) 
    if serializer.is_valid():
        username = serializer.validated_data["username"]
        password = serializer.validated_data["password"]
        #check if user exists in database
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return Response({"message": "Login Successful"}, status=status.HTTP_202_ACCEPTED)
        else:
            #no user found. could be typo or non existant
            return Response({"message": "Login Failed"}, status=status.HTTP_401_UNAUTHORIZED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
    serializer = SignupSerializer(data=request.data)
    if serializer.is_valid(): # calls create() method in UserSerializerWithPasswordAccess. That method may throw sa serializatio nerror if usrename or email already exists
        serializer.save()  
        return Response({"message": "Signup Successful"}, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    '''
    change_password:Allows authenticated user to update their account password. Uses ChangePasswordSerializer to validate old password and set new password.
    @request:
        {
            "old_password": "current_password",
            "password": "new_secure_password"
        }
    @return:
        * HTTP 200 if update succeeds
        * HTTP 400 with validation errors if:
            - old_password does not match the user’s current password
            - new password fails validation (e.g., too short)
    '''
    serializer = ChangePasswordSerializer(data=request.data)
    if serializer.is_valid():
        serializer.update_password(request.user, serializer.validated_data)
        return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
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
    try:
        user = request.user
        username = user.username 
        logout(request) 
        user.delete()
        return Response({"message": f"User '{username}' has been deleted"}, status=status.HTTP_200_OK)
    except:
        return Response({"error": f"Unable to remove user"}, status=status.http)
