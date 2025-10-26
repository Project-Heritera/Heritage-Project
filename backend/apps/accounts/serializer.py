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