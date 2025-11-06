from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from django.db import transaction
from .permissions import user_has_access # Keep this for get_can_edit/etc.
from .models import (
    Badge,
    Room,
    Course, 
    Section,
    Task,
    TaskComponent,
    Tag,
    VisibilityLevel,
)

# -------------------------------
# TaskComponent Serializer
# -------------------------------
class TaskComponentSerializer(serializers.ModelSerializer):
    task_component_id = serializers.IntegerField(source="id", read_only=True)
    content = serializers.JSONField()

    class Meta:
        model = TaskComponent
        fields = ["task_component_id", "type", "content"] # what is sent back


# -------------------------------
# Task Serializer
# -------------------------------
class TaskSerializer(serializers.ModelSerializer):
    task_id = serializers.IntegerField(source="id", read_only=True)
    components = TaskComponentSerializer(many=True, required=False)
    tags = serializers.SlugRelatedField( # so it shows name field instead of its id
        slug_field="name",
        queryset=Tag.objects.all(),
        many=True,
        required=False
    )

    class Meta:
        model = Task
        fields = ["task_id", "tags", "components"]

    def create(self, validated_data):
        # pop nested data out
        components_data = validated_data.pop("components", [])
        tags_data = validated_data.pop("tags", [])

        task = Task.objects.create(**validated_data)

        task.tags.set(tags_data) # go thru, add tags

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

    class Meta:
        model = Badge
        fields = ["badge_id", "image", "title"]


# -------------------------------
# Room Serializer
# -------------------------------
class RoomSerializer(serializers.ModelSerializer):
    course_id = serializers.PrimaryKeyRelatedField(source="course", read_only=True)
    section_id = serializers.PrimaryKeyRelatedField(source="section", read_only=True)
    room_id = serializers.IntegerField(source="id", read_only=True)
    can_edit = serializers.SerializerMethodField()
    tasks = TaskSerializer(many=True, required=False)
    creator = serializers.StringRelatedField(read_only=True)
    created_on = serializers.DateTimeField(read_only=True)
    image = serializers.ImageField(required=False, allow_null=True)
    badge = BadgeSerializer(many=False, required=False)

    class Meta:
        model = Room
        fields = [
            "course_id", "section_id", "room_id", "can_edit",
            "title", "description", "metadata", "visibility", "is_published", 
            "tasks", "creator", "created_on", "image", "badge", "can_edit"
        ]
        read_only_fields = ["course_id", "section_id", "room_id", "creator", "created_on"]

    def get_can_edit(self, obj):
        """
        Whether the current user can edit this room. (Kept for output context)
        """
        request = self.context.get("request")
        user = getattr(request, "user", None)
        # We keep this method because it's responsible for the read-only output field 'can_edit'
        return user_has_access(obj, user, edit=True)

    def validate(self, attrs):
        """Ensure visibility consistency with parent course/section."""
        attrs = super().validate(attrs)
        visibility = attrs.get("visibility", getattr(self.instance, "visibility", None))
        section = attrs.get("section", getattr(self.instance, "section", None))
        course = attrs.get("course", getattr(self.instance, "course", None))

        section_visibility = getattr(section, "visibility", None)
        course_visibility = getattr(course, "visibility", None)

        if visibility == VisibilityLevel.PUBLIC:
            if (section_visibility and section_visibility != VisibilityLevel.PUBLIC) or \
            (course_visibility and course_visibility != VisibilityLevel.PUBLIC):
                raise ValidationError("Public room cannot exist under a private section/course.")

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

        instance.tasks.all().delete() # del everything
        for task_data in tasks_data: # replace everything
            TaskSerializer(context=self.context).create({**task_data, "room": instance})

        return instance


# -------------------------------
# Section Serializer
# -------------------------------
class SectionSerializer(serializers.ModelSerializer):
    course_id = serializers.PrimaryKeyRelatedField(source="course", read_only=True)
    section_id = serializers.IntegerField(source="id", read_only=True) # Changed from PK field for clarity
    creator = serializers.StringRelatedField(read_only=True)
    created_on = serializers.DateTimeField(read_only=True)
    image = serializers.ImageField(required=False, allow_null=True)
    badge = BadgeSerializer(many=False, required=False)

    class Meta:
        model = Section

        fields = [
            "course_id", "section_id", "title", "description", "metadata",
            "visibility", "is_published", "creator", "created_on", 
            "image", "badge",
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
                raise ValidationError("Public section cannot exist under a private course.")
  
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
            section.save(update_fields=['badge'])

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
    course_id = serializers.IntegerField(source="id", read_only=True) # Changed from PK field for clarity
    creator = serializers.StringRelatedField(read_only=True)
    created_on = serializers.DateTimeField(read_only=True)
    image = serializers.ImageField(required=False, allow_null=True)
    badge = BadgeSerializer(many=False, required=False)

    class Meta:
        model = Course

        fields = [
            "course_id", "title", "description", "metadata", "visibility", 
            "is_published", "creator", "created_on", "image", "badge",
        ]
        read_only_fields = ["course_id", "creator", "created_on"]
    
    def validate(self, attrs):
        """No visibility or permission checks needed here."""
        attrs = super().validate(attrs) 
        return attrs

    def create(self, validated_data):
        """Creates a new Course instance."""
        # Handle the one-to-one 'badge' relationship
        badge_data = validated_data.pop("badge", None)
        course = Course.objects.create(**validated_data)
        # Create the nested Badge if provided
        if badge_data:
            badge_serializer = BadgeSerializer(data=badge_data)
            badge_serializer.is_valid(raise_exception=True)
            badge = badge_serializer.save()
            course.badge = badge
            course.save(update_fields=['badge'])
           
        return course

    def update(self, instance, validated_data):
        """Updates an existing Course instance."""
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