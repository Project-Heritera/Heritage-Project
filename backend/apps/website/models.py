from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.contrib.auth import get_user_model
from ordered_model.models import OrderedModel # this handles auto-reordering when something is deleted

User = get_user_model()

# this does *not* include the TextChoices or QuerySet models
__all__ = [
    "Course",
    "Section",
    "Room",
    "Task",
    "TaskComponent",
    "UserCourseAccessLevel",
    "UserSectionAccessLevel",
    "ProgressOfTask",
    "Tag",
    "SavedTask",
    "Dictionary",
    "DictionaryEntry",
]


class AccessLevel(models.TextChoices):
    ADMIN = "AD", _("ADMIN")
    VISITOR = "VI", _("VISITOR")


class VisibilityLevel(models.TextChoices):
    PRIVATE = "PRI", _("PRIVATE")   # devs only
    PUBLIC = "PUB", _("PUBLIC")     # available on web
    LIMITER = "LIM", _("LIMITER")   # certain users only

# The query sets below are used to sum the progress of all tasks 
# that are relevant to the course/section/room 
# and return a percentage complete
class CourseQuerySet(models.QuerySet):
    def user_progress_percent(self, user):
        return self.annotate(
            total_tasks=models.Count("sections__rooms__tasks", distinct=True),
            completed_tasks=models.Count(
                "sections__rooms__tasks__progressoftask",
                filter=models.Q(
                    sections__rooms__tasks__progressoftask__user=user,
                    sections__rooms__tasks__progressoftask__status=Status.COMPLE,
                ),
                distinct=True,
            ),
        ).annotate(
            progress_percent=100.0 * models.F("completed_tasks") / models.F("total_tasks")
        )


class SectionQuerySet(models.QuerySet):
    def user_progress_percent(self, user):
        return self.annotate(
            total_tasks=models.Count("rooms__tasks", distinct=True),
            completed_tasks=models.Count(
                "rooms__tasks__progressoftask",
                filter=models.Q(
                    rooms__tasks__progressoftask__user=user,
                    rooms__tasks__progressoftask__status=Status.COMPLE,
                ),
                distinct=True,
            ),
        ).annotate(
            progress_percent=100.0 * models.F("completed_tasks") / models.F("total_tasks")
        )

    
class RoomQuerySet(models.QuerySet):
    def user_progress_percent(self, user):
        return self.annotate(
            total_tasks=models.Count("tasks", distinct=True),
            completed_tasks=models.Count(
                "tasks__progressoftask",
                filter=models.Q(
                    tasks__progressoftask__user=user,
                    tasks__progressoftask__status=Status.COMPLE
                ),
                distinct=True,
            ),
        ).annotate(
            progress_percent=100.0 * models.F("completed_tasks") / models.F("total_tasks")
        )

class Course(models.Model):
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=255)
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name="created_courses"
    )
    visibility = models.CharField(
        max_length=50,
        choices=VisibilityLevel,
        default=VisibilityLevel.PUBLIC
    )
    access_users = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through="UserCourseAccessLevel",
        related_name="course_access",
        blank=True,
        help_text="Users who can access the course when visibility is set to LIMITER"
    )
    metadata = models.JSONField(default=dict, blank=True)
    created_on = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
    
    objects = CourseQuerySet.as_manager()


class Section(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        null=True,
        related_name="sections"
    )
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=255)
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name="created_sections"
    )
    visibility = models.CharField(
        max_length=50,
        choices=VisibilityLevel,
        default=VisibilityLevel.PUBLIC
    )
    access_users = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through="UserSectionAccessLevel",
        related_name="section_access",
        blank=True,
        help_text="Users who can access the section when visibility is set to LIMITER"
    )
    number_of_problems = models.IntegerField(default=0)
    metadata = models.JSONField(default=dict, blank=True)
    created_on = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.course.title if self.course else 'No Course'} - {self.title}"
    
    objects = SectionQuerySet.as_manager()


class Room(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        null=True,
        related_name="rooms"
    )
    section = models.ForeignKey(
        Section,
        on_delete=models.CASCADE,
        null=True,
        related_name="rooms"
    )
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=255)
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name="created_rooms"
    )
    number_of_problems = models.IntegerField(default=0)
    metadata = models.JSONField(default=dict, blank=True)
    created_on = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.course.title if self.course else 'No Course'} - {self.title}"
    
    objects = RoomQuerySet.as_manager()


class TaskType(models.TextChoices):
    MCQ = "MCQ", _("MULTIPLE CHOICE QUESTION")
    FREERESP = "FREERESP", _("FREE RESPONSE QUESTION")
    FILL = "FILL", _("FILL IN THE BLANK QUESTION")
    TEXT = "TEXT", _("TEXT ONLY")
    # More types can be added later


class Tag(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Task(OrderedModel):
    room = models.ForeignKey(
        Room,
        on_delete=models.CASCADE,
        null=True,
        related_name="tasks"
    )
    type = models.CharField(
        max_length=50,
        choices=TaskType
    )
    tags = models.ManyToManyField(Tag)
    point_value = models.IntegerField(default=0)
    created_on = models.DateTimeField(auto_now_add=True)

    order_with_respect_to = "room" # this creates a 'order' int column in the model table

    def __str__(self):
        return f"{self.room} - {self.type}"


class TaskComponentType(models.TextChoices):
    OPTION = "OPTION", _("QUESTION OPTION CHOICE")
    IMAGE = "IMAGE", _("IMAGE")
    TEXT = "TEXT", _("TEXT")
    # will add more or change labels as needed


class TaskComponent(OrderedModel):
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        null=True,
        related_name="components"
    )
    type = models.CharField(
        max_length=50,
        choices=TaskComponentType
    )
    position = models.PositiveIntegerField(default=0)
    content = models.JSONField(default=dict, blank=True) # the format of this JSON will depend on the TaskComponent.type
    created_on = models.DateTimeField(auto_now_add=True)

    order_with_respect_to = "task"  # this creates a 'order' int column in the model table

    def __str__(self):
        return f"{self.task} - {self.type}"


class UserCourseAccessLevel(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True)
    access_level = models.CharField(
        max_length=50,
        choices=AccessLevel,
        default=AccessLevel.VISITOR
    )

    def __str__(self):
        return f"{self.user.username if self.user else 'Unknown'} → {self.course.title if self.course else 'No Course'} ({self.access_level})"


class UserSectionAccessLevel(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True)
    section = models.ForeignKey(Section, on_delete=models.CASCADE, null=True)
    access_level = models.CharField(
        max_length=50,
        choices=AccessLevel,
        default=AccessLevel.VISITOR
    )

    def __str__(self):
        return f"{self.user.username if self.user else 'Unknown'} → {self.section.title if self.section else 'No Section'} ({self.access_level})"


class Status(models.TextChoices):
    NOSTAR = "NOSTAR", _("NOT STARTED")
    INPROG = "INPROG", _("IN-PROGRESS")
    COMPLE = "COMPLE", _("COMPLETED")


class ProgressOfTask(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True)
    section = models.ForeignKey(Section, on_delete=models.CASCADE, null=True)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, null=True)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, null=True)
    status = models.CharField(
        max_length=50,
        choices=Status,
        default=Status.NOSTAR
    )
    attempts = models.IntegerField(default=0)
    last_attempt = models.DateTimeField(auto_now=True)
    score = models.FloatField(default=0.0)
    metadata = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.user.username if self.user else 'Unknown'} → {self.room.title if self.Room else 'No Room'} ({self.status})"


class SavedTask(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True)
    section = models.ForeignKey(Section, on_delete=models.CASCADE, null=True)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, null=True)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, null=True)
    status = models.CharField(
        max_length=50,
        choices=Status,
        default=Status.NOSTAR
    )
    saved_at = models.DateTimeField()
    metadata = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.user.username if self.user else 'Unknown'} → {self.task if self.task else 'No Saved Problems'} ({self.status})"


class Dictionary(models.Model):
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True)
    language = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.language} Dictionary"


class DictionaryEntry(models.Model):
    language = models.ForeignKey(Dictionary, on_delete=models.SET_NULL, null=True)
    word = models.CharField(max_length=100)
    definition = models.CharField(max_length=200)
    part_of_speech = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.word}"