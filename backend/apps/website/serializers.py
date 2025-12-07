from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from django.db import transaction
from .models import (
    Badge,
    ProgressOfTask,
    Report,
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
    UserRoomAccessLevel,
    UserCourseAccessLevel,
    UserSectionAccessLevel
)

# -------------------------------
# Report Serializer
# -------------------------------
class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ["messege", "reported_obj"]

# -------------------------------
# UserXAccessLevel Serializers
# -------------------------------
class UserCourseAccessLevelSerializer(serializers.ModelSerializer):
    access_level_id = serializers.IntegerField(source="id", read_only=True)
    access_level = serializers.CharField()
    user = serializers.CharField(source="user.username")
    course = serializers.CharField(source="course.title")

    class Meta:
        model = UserCourseAccessLevel
        fields = ["access_level_id", "access_level", "user", "course"]  # what is sent back
        read_only_fields = ["access_level_id"]

class UserSectionAccessLevelSerializer(serializers.ModelSerializer):
    access_level_id = serializers.IntegerField(source="id", read_only=True)
    access_level = serializers.CharField()
    user = serializers.CharField(source="user.username")
    section = serializers.CharField(source="section.title")

    class Meta:
        model = UserSectionAccessLevel
        fields = ["access_level_id", "access_level", "user", "section"]  # what is sent back
        read_only_fields = ["access_level_id"]

class UserRoomAccessLevelSerializer(serializers.ModelSerializer):
    access_level_id = serializers.IntegerField(source="id", read_only=True)
    access_level = serializers.CharField()
    user = serializers.CharField(source="user.username")
    room = serializers.CharField(source="room.title")

    class Meta:
        model = UserRoomAccessLevel
        fields = ["access_level_id", "access_level", "user", "room"]  # what is sent back
        read_only_fields = ["access_level_id"]


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

    def update(self, instance, validated_data):
        components_data = validated_data.pop("components", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if components_data is None:
            return instance

        existing = {c.id: c for c in instance.components.all()}

        for comp in components_data:
            comp_id = comp.get("task_component_id")

            if comp_id in existing:
                TaskComponentSerializer(existing[comp_id],
                                        data=comp,
                                        partial=True,
                                        context=self.context).save()
            else:
                TaskComponentSerializer(context=self.context).create({**comp, "task": instance})

        return instance

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

    # Write-only field to set badge via ID
    badge_id = serializers.PrimaryKeyRelatedField(
        queryset=Badge.objects.all(), write_only=True, required=False
    )
    # Read-only field to return full badge object
    badge = BadgeSerializer(read_only=True)

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
            "badge_id",
        ]
        read_only_fields = [
            "course_id",
            "section_id",
            "room_id",
            "creator",
            "created_on",
            "can_edit",
            "badge",
        ]

    def validate(self, attrs):
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
        # Handle badge_id separately
        badge = validated_data.pop("badge_id", None)
        tasks_data = validated_data.pop("tasks", [])

        room = Room.objects.create(**validated_data)

        if badge:
            room.badge = badge
            room.save(update_fields=["badge"])

        for task_data in tasks_data:
            TaskSerializer(context=self.context).create({**task_data, "room": room})

        return room

    @transaction.atomic
    def update(self, instance, validated_data):
        badge = validated_data.pop("badge_id", None)
        tasks_data = validated_data.pop("tasks", [])

        if badge:
            instance.badge = badge

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if tasks_data is None:
            return instance

        existing_tasks = {task.id: task for task in instance.tasks.all()}

        for task in tasks_data:
            task_id = task.get("task_id")
            if task_id and task_id in existing_tasks:
                TaskSerializer(existing_tasks[task_id],
                               data=task,
                               partial=True,
                               context=self.context).save()
            else:
                TaskSerializer(context=self.context).create({**task, "room": instance})

        return instance

# -------------------------------
# Section Serializer
# -------------------------------
class SectionSerializer(serializers.ModelSerializer):
    course_id = serializers.PrimaryKeyRelatedField(source="course", read_only=True)
    section_id = serializers.IntegerField(source="id", read_only=True)
    creator = serializers.StringRelatedField(read_only=True)
    created_on = serializers.DateTimeField(read_only=True)
    image = serializers.ImageField()
    is_published = serializers.BooleanField(default=True)

    badge_id = serializers.PrimaryKeyRelatedField(
        queryset=Badge.objects.all(), write_only=True, required=False, allow_null=True
    )
    badge = BadgeSerializer(read_only=True)  # GET returns full badge

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
            "badge_id",
        ]
        read_only_fields = ["course_id", "section_id", "creator", "created_on", "badge"]

    def validate(self, attrs):
        attrs = super().validate(attrs)
        visibility = attrs.get("visibility", getattr(self.instance, "visibility", None))
        course = attrs.get("course", getattr(self.instance, "course", None))
        course_visibility = getattr(course, "visibility", None)

        if visibility == VisibilityLevel.PUBLIC and course_visibility != VisibilityLevel.PUBLIC:
            raise ValidationError("Public section cannot exist under a private course.")

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        badge = validated_data.pop("badge_id", None)
        section = Section.objects.create(**validated_data)

        if badge:
            section.badge = badge
            section.save(update_fields=["badge"])

        return section

    @transaction.atomic
    def update(self, instance, validated_data):
        badge = validated_data.pop("badge_id", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if badge:
            instance.badge = badge

        instance.save()
        return instance


# -------------------------------
# Course Serializer
# -------------------------------
class CourseSerializer(serializers.ModelSerializer):
    course_id = serializers.IntegerField(source="id", read_only=True)
    creator = serializers.StringRelatedField(read_only=True)
    created_on = serializers.DateTimeField(read_only=True)
    image = serializers.ImageField()
    is_published = serializers.BooleanField(default=False)
    visibility = serializers.ChoiceField(choices=VisibilityLevel.choices, default=VisibilityLevel.PRIVATE)

    badge_id = serializers.PrimaryKeyRelatedField(
        queryset=Badge.objects.all(), write_only=True, required=False, allow_null=True
    )
    badge = BadgeSerializer(read_only=True)

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
            "badge_id",
        ]
        read_only_fields = ["course_id", "creator", "created_on", "badge"]

    @transaction.atomic
    def create(self, validated_data):
        badge = validated_data.pop("badge_id", None)
        course = Course.objects.create(**validated_data)

        if badge:
            course.badge = badge
            course.save(update_fields=["badge"])

        return course

    @transaction.atomic
    def update(self, instance, validated_data):
        badge = validated_data.pop("badge_id", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if badge:
            instance.badge = badge

        instance.save()
        return instance


from rest_framework import serializers

def get_historical_serializer(historical_model_class):
    """
    Dynamically creates a ModelSerializer for the given historical model class.
    
    This ensures all fields (including the base model fields and the history 
    fields like 'history_date', 'history_user', and 'ip_address') are included.
    
    :param historical_model_class: The model class automatically created by 
                                   django-simple-history (e.g., HistoricalProduct).
    :return: A ready-to-use ModelSerializer class.
    """

    class HistoricalRecordSerializer(serializers.ModelSerializer):
        # Override history_user to return a string (username) instead of a PK/Object
        history_user = serializers.SerializerMethodField()

        class Meta:
            model = historical_model_class
            # Use '__all__' to automatically include all fields from the historical model,
            # which includes all original model fields + all history-specific fields.
            fields = '__all__'
            
        def get_history_user(self, obj):
            """Returns the username or a default string."""
            if obj.history_user:
                # Assuming history_user is a standard User model instance
                return obj.history_user.username
            return "System"

    return HistoricalRecordSerializer