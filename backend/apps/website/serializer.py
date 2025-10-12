from rest_framework import serializers
from .models import Element, Tag, ProblemSet


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ("id", "name")


class ProblemSetSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProblemSet
        fields = ("id", "title")


class ElementSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    problemset = ProblemSetSerializer(read_only=True)

    class Meta:
        model = Element
        fields = (
            "id",
            "problemset",
            "content",
            "type",
            "tags",
            "point_value",
            "interface_data",
            "created_on",
        )
