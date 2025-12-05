from django.contrib.auth import get_user_model
from friendship.models import FriendshipRequest
from rest_framework import serializers
from django.contrib.auth.models import User

User = get_user_model()


# -------------------------------
# 2FA Serializers
# -------------------------------
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

class VerifyLoginMFARequest(serializers.Serializer):
    ephemeral_token = serializers.CharField(source="temp_token")
    otp = serializers.CharField(source="code")

# -------------------------------
# User Serializer
# -------------------------------
class UserSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="id", read_only=True)
    username = serializers.CharField(read_only=True)
    profile_pic = serializers.ImageField()
    description = serializers.CharField()
    streak = serializers.IntegerField()
    longest_streak = serializers.IntegerField()
    date_joined = serializers.DateTimeField()

    class Meta:
        model = User
        fields = ["user_id", "username", "profile_pic", "description", "date_joined", "email", "streak", "longest_streak"]
        read_only_fields = ["user_id", "date_joined"]


# -------------------------------
# FriendshipRequest Serializer
# -------------------------------
class FriendshipRequestSerializer(serializers.ModelSerializer):
    to_user = serializers.CharField(source="to_user.username")
    from_user = serializers.CharField(source="from_user.username")
    created = serializers.SerializerMethodField()

    def get_created(self, obj) -> str:
        return obj.created.isoformat() if obj.created else None

    class Meta:
        model = FriendshipRequest
        fields = ["id", "to_user", "from_user", "created", "rejected"]