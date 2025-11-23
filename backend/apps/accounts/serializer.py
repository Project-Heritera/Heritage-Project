from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.contrib.auth.models import User

User = get_user_model()

# -------------------------------
# User Serializer
# -------------------------------
class UserSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="id", read_only=True)
    username = serializers.CharField(read_only=True)
    profile_pic = serializers.ImageField()
    description = serializers.CharField()

    class Meta:
        model = User
        fields = ["user_id", "username", "profile_pic", "description", "date_joined"]
        read_only_fields = ["user_id"]