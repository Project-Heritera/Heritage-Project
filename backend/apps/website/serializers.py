from rest_framework import serializers
from rest_framework.exceptions import ValidationError, PermissionDenied
from .models import (
    Room,
    Course, 
    Section,
    Task,
    TaskComponent,
    Tag,
    UserCourseAccessLevel,
    UserSectionAccessLevel,
    UserRoomAccessLevel,
    VisibilityLevel,
    AccessLevel,
)

# -------------------------------
# TaskComponent Serializer
# -------------------------------
class TaskComponentSerializer(serializers.ModelSerializer):
    task_component_id = serializers.IntegerField(source="id", read_only=True)
    content = serializers.JSONField(source="content")

    class Meta:
        model = TaskComponent
        fields = ["task_component_id", "type", "content"] # what is sent back


# -------------------------------
# Task Serializer
# -------------------------------
class TaskSerializer(serializers.ModelSerializer):
    task_id = serializers.IntegerField(source="id", read_only=True)
    point_value = serializers.IntegerField(source="point_value")
    components = TaskComponentSerializer(source="components", many=True, required=False)
    tags = serializers.SlugRelatedField( # so it shows name field instead of its id
        slug_field="name",
        queryset=Tag.objects.all(),
        many=True,
        required=False
    )

    class Meta:
        model = Task
        fields = ["task_id", "point_value", "tags", "components"]

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
# Room Serializer
# -------------------------------

class RoomSerializer(serializers.ModelSerializer):
    course_id = serializers.IntegerField(source="course", read_only=True)
    section_id = serializers.IntegerField(source="section", read_only=True)
    room_id = serializers.IntegerField(source="id", read_only=True)
    can_edit = serializers.SerializerMethodField()
    tasks = TaskSerializer(many=True, required=False)
    creator = serializers.StringRelatedField(read_only=True)
    created_on = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Room
        fields = [
            "course_id",
            "section_id",
            "room_id",
            "can_edit", # rn just reflects if has access bool
            "course",
            "section",
            "title",
            "description",
            "metadata",
            "visibility",
            "is_published",
            "tasks",
            "creator", # as above, this is just a str
            "created_on",
        ]
        read_only_fields = ["course_id", "section_id", "room_id", "creator", "created_on"]

    # -------------------------------
    # Access / Permission Logic
    # -------------------------------

    def _user_has_access(self, room, user, *, edit=False):
        """Implements visibility + access rules."""
        if not user or not user.is_authenticated:
            return False

        # Creator always has access
        if room.creator == user:
            return True

        visibility = getattr(room, "visibility", None)
        course_id = getattr(room.course, "id", None)
        section_id = getattr(room.section, "id", None)
        room_id = getattr(room, "id", None)

        # --- PRIVATE ---
        if visibility == VisibilityLevel.PRIVATE:
            # Must be admin in all of course/section/room
            if (
                UserCourseAccessLevel.objects.filter(
                    user=user, course_id=course_id, access_level=AccessLevel.ADMIN
                ).exists()
                and UserSectionAccessLevel.objects.filter(
                    user=user, section_id=section_id, access_level=AccessLevel.ADMIN
                ).exists()
                and UserRoomAccessLevel.objects.filter(
                    user=user, room_id=room_id, access_level=AccessLevel.ADMIN
                ).exists()
            ):
                return True
            return False

        # --- LIMITER ---
        if visibility == VisibilityLevel.LIMITER:
            # Must have *any* access level in all course/section/room
            course_access = UserCourseAccessLevel.objects.filter(user=user, course_id=course_id).first()
            section_access = UserSectionAccessLevel.objects.filter(user=user, section_id=section_id).first()
            room_access = UserRoomAccessLevel.objects.filter(user=user, room_id=room_id).first()

            if not (course_access and section_access and room_access):
                return False

            # If editing, visitors are NOT allowed
            if edit:
                if (
                    course_access.access_level == AccessLevel.VISITOR
                    or section_access.access_level == AccessLevel.VISITOR
                    or room_access.access_level == AccessLevel.VISITOR
                ):
                    return False
            return True

        # --- PUBLIC ---
        return True

    def get_editing_mode(self, obj):
        """
        Whether the current user can edit this room.
        True only if user has edit-level (non-visitor) access.
        """
        request = self.context.get("request")
        user = getattr(request, "user", None)
        return self._user_has_access(obj, user, edit=True)


    # -------------------------------
    # Validation
    # -------------------------------

    # used for *input validation*
    def validate(self, attrs):
        """Ensure visibility consistency with parent course/section."""
        attrs = super().validate(attrs)
        visibility = attrs.get("visibility", getattr(self.instance, "visibility", None))
        section = attrs.get("section", getattr(self.instance, "section", None))
        course = attrs.get("course", getattr(self.instance, "course", None))

        request = self.context.get("request")
        user = getattr(request, "user", None)

        section_visibility = getattr(section, "visibility", None)
        course_visibility = getattr(course, "visibility", None)

        if visibility == VisibilityLevel.PUBLIC:
            if (section_visibility and section_visibility != VisibilityLevel.PUBLIC) or \
            (course_visibility and course_visibility != VisibilityLevel.PUBLIC):
                raise ValidationError("Public room cannot exist under a private or limited section/course.")

        # For updates, enforce edit permission
        if self.instance and not self._user_has_access(self.instance, user, edit=True):
            raise PermissionDenied("You do not have permission to modify this room.")

        return attrs

    # used for *output validation*
    def to_representation(self, instance):
        request = self.context.get("request")
        user = getattr(request, "user", None)

        if user and not self._user_has_access(instance, user):
            raise PermissionDenied("You do not have permission to access this room.")

        return super().to_representation(instance)

    # -------------------------------
    # CRUD Logic
    # -------------------------------

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