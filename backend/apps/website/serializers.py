from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from django.db import transaction
from .models import (
    Badge,
    ProgressOfTask,
    Room,
    Course,
    Section,
    Status,
    Task,
    TaskComponent,
    Tag,
    UserBadge,
    VisibilityLevel,
    ProgressOfTask,
)


# -------------------------------
# TaskComponent Serializer
# -------------------------------
class TaskComponentSerializer(serializers.ModelSerializer):
    task_component_id = serializers.IntegerField(source="id", read_only=True)
    content = serializers.JSONField()

    class Meta:
        model = TaskComponent
        fields = ["task_component_id", "type", "content"]  # what is sent back
        read_only_fields = ["task_component_id"]


# -------------------------------
# Task Serializer
# -------------------------------
class TaskSerializer(serializers.ModelSerializer):
    task_id = serializers.IntegerField(source="id", read_only=True)
    components = TaskComponentSerializer(many=True, required=False)
    tags = serializers.SlugRelatedField(  # so it shows name field instead of its id
        slug_field="name", queryset=Tag.objects.all(), many=True, required=False
    )

    class Meta:
        model = Task
        fields = ["task_id", "tags", "components"]
        read_only_fields = ["task_id"]

    def create(self, validated_data):
        # pop nested data out
        components_data = validated_data.pop("components", [])
        tags_data = validated_data.pop("tags", [])

        task = Task.objects.create(**validated_data)

        task.tags.set(tags_data)  # go thru, add tags

        # go thru, add components
        for comp_data in components_data:
            TaskComponent.objects.create(task=task, **comp_data)

        return task


# -------------------------------
# Badge Serializer
# -------------------------------
class BadgeSerializer(serializers.ModelSerializer):
    badge_id = serializers.IntegerField(source="id", read_only=True)
    image = serializers.ImageField()
    title = serializers.CharField()
    description = serializers.CharField()

    class Meta:
        model = Badge
        fields = ["badge_id", "image", "title", "description"]
        read_only_fields = ["badge_id"]


# -------------------------------
# UserBadge Serializer
# -------------------------------
class UserBadgeSerializer(serializers.ModelSerializer):
    userbadge_id = serializers.IntegerField(source="id", read_only=True)
    user = serializers.CharField(source="user.username")
    badge = BadgeSerializer(read_only=True)

    class Meta:
        model = UserBadge
        fields = ["userbadge_id", "user", "badge", "awarded_at"]
        read_only_fields = ["userbadge_id", "user", "badge", "awarded_at"]


# -------------------------------
# ProgressOfTask Serializer
# -------------------------------
class ProgressOfTaskSerializer(serializers.ModelSerializer):
    progress_id = serializers.IntegerField(source="id", read_only=True)
    task_id = serializers.IntegerField(source="task.id", read_only=True)
    task_title = serializers.CharField(source="task.title", read_only=True)
    room_title = serializers.CharField(source="task.room.title", read_only=True)

    status = serializers.ChoiceField(choices=Status.choices)
    attempts = serializers.IntegerField()
    metadata = serializers.JSONField()

    class Meta:
        model = ProgressOfTask
        fields = [
            "progress_id",
            "user",
            "task_id",
            "task_title",
            "room_title",
            # the below three are the only that will change
            "status",
            "attempts",
            "metadata",
        ]
        read_only_fields = ["progress_id", "task_id", "task_title", "room_title"]


# -------------------------------
# Room Serializer
# -------------------------------
class RoomSerializer(serializers.ModelSerializer):
    course_id = serializers.PrimaryKeyRelatedField(source="course", read_only=True)
    section_id = serializers.PrimaryKeyRelatedField(source="section", read_only=True)
    room_id = serializers.IntegerField(source="id", read_only=True)
    tasks = TaskSerializer(many=True, required=False)
    creator = serializers.StringRelatedField(read_only=True)
    created_on = serializers.DateTimeField(read_only=True)
    last_updated = serializers.DateTimeField(required=False)
    image = serializers.ImageField(required=False, allow_null=True)
    badge = BadgeSerializer(many=False, required=False)

    class Meta:
        model = Room
        fields = [
            "course_id",
            "section_id",
            "room_id",
            "can_edit",
            "title",
            "description",
            "metadata",
            "visibility",
            "is_published",
            "tasks",
            "creator",
            "created_on",
            "last_updated",
            "image",
            "badge",
        ]
        read_only_fields = [
            "course_id",
            "section_id",
            "room_id",
            "creator",
            "created_on",
            "can_edit",
        ]

    def validate(self, attrs):
        """Ensure visibility consistency with parent course/section."""
        attrs = super().validate(attrs)
        visibility = attrs.get("visibility", getattr(self.instance, "visibility", None))
        section = attrs.get("section", getattr(self.instance, "section", None))
        course = attrs.get("course", getattr(self.instance, "course", None))

        section_visibility = getattr(section, "visibility", None)
        course_visibility = getattr(course, "visibility", None)

        if visibility == VisibilityLevel.PUBLIC:
            if (
                section_visibility and section_visibility != VisibilityLevel.PUBLIC
            ) or (course_visibility and course_visibility != VisibilityLevel.PUBLIC):
                raise ValidationError(
                    "Public room cannot exist under a private section/course."
                )

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        tasks_data = validated_data.pop("tasks", [])
        room = Room.objects.create(**validated_data)

        for task_data in tasks_data:
            TaskSerializer(context=self.context).create({**task_data, "room": room})

        return room

    # this also means the frontend must send *all* the data back, not just the stuff thats changed
    def update(self, instance, validated_data):
        tasks_data = validated_data.pop("tasks", [])

        # update main fields, ensures we only del/replace *after* the db has been updated with most recent changes
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        instance.tasks.all().delete()  # del everything
        for task_data in tasks_data:  # replace everything
            TaskSerializer(context=self.context).create({**task_data, "room": instance})

        return instance


# -------------------------------
# Section Serializer
# -------------------------------
class SectionSerializer(serializers.ModelSerializer):
    course_id = serializers.PrimaryKeyRelatedField(source="course", read_only=True)
    section_id = serializers.IntegerField(
        source="id", read_only=True
    )  # Changed from PK field for clarity
    creator = serializers.StringRelatedField(read_only=True)
    created_on = serializers.DateTimeField(read_only=True)
    image = serializers.ImageField(required=False, allow_null=True)
    badge = BadgeSerializer(many=False, required=False)

    class Meta:
        model = Section

        fields = [
            "course_id",
            "section_id",
            "title",
            "description",
            "metadata",
            "visibility",
            "is_published",
            "creator",
            "created_on",
            "image",
            "badge",
        ]
        read_only_fields = ["course_id", "section_id", "creator", "created_on"]

    def validate(self, attrs):
        """Ensure visibility consistency with the parent course."""
        attrs = super().validate(attrs)

        # Determine current/new visibility and parent course
        visibility = attrs.get("visibility", getattr(self.instance, "visibility", None))
        course = attrs.get("course", getattr(self.instance, "course", None))

        course_visibility = getattr(course, "visibility", None)

        # 1. Visibility Consistency Check
        if visibility == VisibilityLevel.PUBLIC:
            # A public section cannot exist under a non-public course.
            if course_visibility and course_visibility != VisibilityLevel.PUBLIC:
                raise ValidationError(
                    "Public section cannot exist under a private course."
                )

        return attrs

    def create(self, validated_data):
        """Creates a new Section instance."""
        # NOTE: The parent 'course' field is usually passed in the view (as seen in create_section)
        # However, if 'badge' data is sent, we need to handle it.
        badge_data = validated_data.pop("badge", None)
        section = Section.objects.create(**validated_data)
        # Create the nested Badge if provided
        if badge_data:
            badge_serializer = BadgeSerializer(data=badge_data)
            badge_serializer.is_valid(raise_exception=True)
            badge = badge_serializer.save()
            section.badge = badge
            section.save(update_fields=["badge"])

        return section

    def update(self, instance, validated_data):
        """Updates an existing Section instance."""
        # Pop nested data for manual update
        badge_data = validated_data.pop("badge", None)

        # Update main fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Handle nested Badge update or creation
        if badge_data:
            if instance.badge:
                # Update existing badge
                badge_serializer = BadgeSerializer(instance.badge, data=badge_data)
            else:
                # Create a new badge and link it
                badge_serializer = BadgeSerializer(data=badge_data)

            badge_serializer.is_valid(raise_exception=True)
            instance.badge = badge_serializer.save()

        instance.save()
        return instance


# -------------------------------
# Course Serializer
# -------------------------------
class CourseSerializer(serializers.ModelSerializer):
    course_id = serializers.IntegerField(
        source="id", read_only=True
    )  # Changed from PK field for clarity
    creator = serializers.StringRelatedField(read_only=True)
    created_on = serializers.DateTimeField(read_only=True)
    image = serializers.ImageField()
    is_published = serializers.BooleanField(default=True)  # default to True
    badge = serializers.PrimaryKeyRelatedField(
        queryset=Badge.objects.all(), required=False, allow_null=True
    )


    class Meta:
        model = Course

        fields = [
            "course_id",
            "title",
            "description",
            "metadata",
            "visibility",
            "is_published",
            "creator",
            "created_on",
            "image",
            "badge",
        ]
        read_only_fields = ["course_id", "creator", "created_on"]

    def validate(self, attrs):
        """No visibility or permission checks needed here."""
        attrs = super().validate(attrs)
        return attrs

def create(self, validated_data):
    badge = validated_data.pop("badge", None)  # this will be a Badge instance from PK
    course = Course.objects.create(**validated_data)
    if badge:
        course.badge = badge
        course.save(update_fields=["badge"])
    return course


def update(self, instance, validated_data):
    badge = validated_data.pop("badge", None)
    for attr, value in validated_data.items():
        setattr(instance, attr, value)
    if badge:
        instance.badge = badge
    instance.save()
    return instance
