from rest_framework import serializers
from django.contrib.auth.models import User

    
class UserSerializer(serializers.ModelSerializer):
    '''
    UserSerializer: Serializer for the built-in Django User model which we will be using for the user table.
    @Meta:
        model: User - Uses Django's built-in User model.
        fields: List of fields to expose:
            - "id": int, the unique identifier of the user
            - "username": str, the user's username
            - "email": str, the user's email address
            - "date_joined": datetime, when the user was created
        @NOTE: password exists but not in fields because we dont want to expose it. Other serializers will have access to it
    '''
    class Meta:
        model=User #instead of making user model manually, using djangos built in user one that has all the fields we need and handles hashing 
        fields = ["id", "username", "email", "date_joined"]


#need seperate serializer from userserializer because SignUp and change my password should be the only function with access to the password field 
class SignupSerializer(serializers.ModelSerializer):
    '''
    SignupSerializer: Serializer for creating a new user account in the db.
    @fields:
        - "username": str, required
        - "email": str, required
        - "password": str, required, write-only, min_length=8
    '''
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def validate(self, attrs):
        '''
        validate:helper function for create that checks if the username and email provided do not already exist in the database.
        @attrs: Dictionary of input data, expected to contain:
            - "username": str   
            - "email": str
        @raises:
            serializers.ValidationError: If the username or email already exists in the database.
        @return:
            dict: The original attrs dictionary if validation passes.
        '''
        username = attrs.get("username")
        email = attrs.get("email")
        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError({"username": "Username already exists"})
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "Email already exists"})
        return attrs
    def create(self, validated_data):
        '''
        create:makes a new User instance in the database.
        @validated_data: Dictionary containing user data,
            must include:
            - "username": str
            - "email": str
            - "password": str (will be hashed)
        @return:
            User: The newly created User instance with the password hashed.
        '''
        user = User(
            username=validated_data["username"],
            email=validated_data["email"],
        )
        user.set_password(validated_data["password"])  # hashes password
        user.save()
        return user


class ChangePasswordSerializer(serializers.Serializer):
    '''
    ChangePasswordSerializer: Serializer for changing a user's password.
    @fields:
        - "old_password": str, required, write-only, the user's current password
        - "password": str, required, write-only, the new password
    '''
    old_password = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, required=True, min_length=8)

    def validate(self, attrs):
        return attrs

    def update_password(self, user, validated_data):
        '''
        update_password:Updates the password for a given user after validating the old password.
        @user: The User instance whose password is being changed.
        @validated_data: Dictionary containing:
            - "old_password": str, the current password of the user
            - "password": str, the new password to set
        @raises:
            serializers.ValidationError: If the old_password does not match the user's current password.
        @return:
            User: The updated User instance with the new hashed password.
        '''
        old_password = validated_data.get("old_password")
        new_password = validated_data.get("password")

        if not user.check_password(old_password):
            raise serializers.ValidationError({"old_password": "Old password is incorrect"})

        user.set_password(new_password)
        user.save()
        return user