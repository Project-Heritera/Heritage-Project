from rest_framework import serializers
from .models import Room, Task, TaskComponent, Tag


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
    room_id = serializers.IntegerField(source="id", read_only=True)
    editing_mode = serializers.SerializerMethodField()  # frontend only
    tasks = TaskSerializer(many=True, required=False)
    creator = serializers.StringRelatedField(read_only=True)  # or SerializerMethodField if you want a dict
    created_on = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Room
        fields = [
            "room_id",
            "editing_mode",  # frontend only, rn literally just returns whether your the creator or not
            "course",
            "section",
            "title",
            "description",
            "metadata",
            "tasks",
            "creator", # as above, this is just a str
            "created_on",
        ]
        read_only_fields = ["room_id", "creator", "created_on"]

    # if your the creator, you can edit (might want to change later)
    # will likely have to mess with the access models more instead of doing this stuff
    def get_editing_mode(self, obj):
        request = self.context.get("request")
        if request and request.user == obj.creator:
            return True
        return False

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
