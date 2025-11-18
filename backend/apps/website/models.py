from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.contrib.auth import get_user_model
from ordered_model.models import (
    F,
    OrderedModel,
)  # this handles auto-reordering when something is deleted
from django.db.models import Q, Case, Value, When

User = get_user_model()


# | Visibility  | AccessLevel  | can_view  | can_edit   |
# | PUBLIC      | (anyone)     | ✅        | ❌        |
# | PRIVATE     | none         | ❌        | ❌        |
# | PRIVATE     | VISITOR      | ✅        | ❌        |
# | PRIVATE     | EDITOR       | ✅        | ✅        |


# access level is only relevant for PRIVATE rooms/sections/courses
class AccessLevel(models.TextChoices):
    # this can't be changed to a boolean bc it's intentionally
    # so that you can be both not a visitor and also not a editor (none)
    EDITOR = "ED", _("EDITOR")
    VISITOR = "VI", _("VISITOR")


class VisibilityLevel(models.TextChoices):
    PUBLIC = "PUB", _(
        "PUBLIC"
    )  # rn basically completely the same as is_published in functionality
    PRIVATE = "PRI", _("PRIVATE")


class CourseQuerySet(models.QuerySet):
    """Custom QuerySet for the Course model to handle access filtering."""

    def filter_by_user_access(self, user):
        """
        Returns a QuerySet of Courses that the given user has permission to view.

        Permission rules:
        1. Creator (always has access).
        2. Superuser/Staff (always has access).
        3. Public courses (if published).
        4. Limited courses (if the user is in access_users).
        5. Private courses (only the creator can view).
        """

        # 1. Superuser/Staff Bypass (Highest Priority)
        if user.is_superuser or user.is_staff:
            return self.all()

        # 2. General View Logic (Combined Q objects)
        # Combine all conditions where a regular authenticated user can view the course:
        view_conditions = (
            Q(
                # Condition A: The user is the creator (creator can always view)
                creator=user
            )
            | Q(
                # Condition B: The course is Public AND published
                visibility=VisibilityLevel.PUBLIC,
                is_published=True,
            )
            | Q(visibility=VisibilityLevel.PRIVATE, access_users=user)
        )

        # Note: Private courses are covered only by Condition A (creator=user).

        # 3. Apply the combined filter
        return self.filter(view_conditions).distinct()

    # used to sum the progress of all tasks as a percentage
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
            progress_percent=Case(
                When(total_tasks=0, then=Value(0)),
                default=100.0 * F("completed_tasks") / F("total_tasks"),
                output_field=models.FloatField(),
            )
        )


class SectionQuerySet(models.QuerySet):
    """Custom QuerySet for the Section model to handle access filtering."""

    def filter_by_user_access(self, user):
        """
        Returns a QuerySet of Sections the user can view, enforcing hierarchical access.
        """
        # 1. Superuser/Staff Bypass
        if user.is_superuser or user.is_staff:
            return self.all()

        # --- Hierarchy Rule: The user must have VIEW access to the parent Course. ---
        # Get the Course queryset that the user can view (using the CourseQuerySet logic)
        viewable_courses = Course.objects.filter_by_user_access(user)

        # Start with all sections belonging to courses the user can view.
        base_filter = Q(course__in=viewable_courses)

        # --- Section-Specific Visibility Rules ---
        # The user can view the section if they meet the hierarchy rule AND:
        section_view_conditions = (
            Q(
                # Condition A: The user is the section creator
                creator=user
            )
            | Q(
                # Condition B: The section is Public AND published
                visibility=VisibilityLevel.PUBLIC,
                is_published=True,
            )
            | Q(visibility=VisibilityLevel.PRIVATE, access_users=user)
        )

        # Combine the base filter with the section-specific rules.
        final_filter = base_filter & section_view_conditions

        return self.filter(final_filter).distinct()

    # used to sum the progress of all tasks as a percentage
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
            progress_percent=Case(
                When(total_tasks=0, then=Value(0)),
                default=100.0 * F("completed_tasks") / F("total_tasks"),
                output_field=models.FloatField(),
            )
        )


class RoomQuerySet(models.QuerySet):
    """Custom QuerySet for the Room model to handle access filtering."""

    def filter_by_user_access(self, user):
        """
        Returns a QuerySet of Rooms the user can view, enforcing hierarchical access.
        """
        # 1. Superuser/Staff Bypass
        if user.is_superuser or user.is_staff:
            return self.all()

        # --- Hierarchy Rule: The user must have VIEW access to the parent Section. ---
        # Get the Section queryset that the user can view (using the SectionQuerySet logic)
        # Note: self.model.objects.filter_by_user_access(user) creates recursion,
        # so we must call the method on the manager of the parent model.
        viewable_sections = Section.objects.filter_by_user_access(user)

        # Start with all rooms belonging to sections the user can view.
        base_filter = Q(section__in=viewable_sections)

        # --- Room-Specific Visibility Rules ---
        # The user can view the room if they meet the hierarchy rule AND:
        room_view_conditions = (
            Q(
                # Condition A: The user is the room creator
                creator=user
            )
            | Q(
                # Condition B: The room is Public AND published
                visibility=VisibilityLevel.PUBLIC,
                is_published=True,
            )
            | Q(visibility=VisibilityLevel.PRIVATE, access_users=user)
        )

        # Combine the base filter with the room-specific rules.
        final_filter = base_filter & room_view_conditions

        return self.filter(final_filter).distinct()

    # used to sum the progress of all tasks as a percentage
    def user_progress_percent(self, user):
        return self.annotate(
            total_tasks=models.Count("tasks", distinct=True),
            completed_tasks=models.Count(
                "tasks__progressoftask",
                filter=models.Q(
                    tasks__progressoftask__user=user,
                    tasks__progressoftask__status=Status.COMPLE,
                ),
                distinct=True,
            ),
        ).annotate(
            progress_percent=Case(
                When(total_tasks=0, then=Value(0)),
                default=100.0 * F("completed_tasks") / F("total_tasks"),
                output_field=models.FloatField(),
            )
        )


def default_badge_image():
    return "Images/default.png"  # change to whatever the path is to the image, rn theres no actual image here


class Badge(models.Model):
    image = models.ImageField(upload_to="Images/", default=default_badge_image)
    title = models.CharField(max_length=100)

    def __str__(self):
        return self.title

    # override save() so it uses default badge image when saved
    def save(self, *args, **kwargs):
        # Ensure the image has a default value if not provided.
        # Previously this referenced a non-existent `badge_id` attribute
        # which raised AttributeError when saving from the admin.
        try:
            has_image = bool(self.image)
        except Exception:
            has_image = False

        if not has_image:
            self.image = default_badge_image()

        super().save(*args, **kwargs)


# relation between user and badge; "user X has badge Y"
class UserBadge(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    awarded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user}'s {self.badge}"


class Course(models.Model):
    badge = models.OneToOneField(
        Badge, on_delete=models.SET_NULL, null=True, blank=True, related_name="course"
    )
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=255)
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_courses",
    )
    visibility = models.CharField(
        max_length=50, choices=VisibilityLevel, default=VisibilityLevel.PRIVATE
    )
    access_users = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through="UserCourseAccessLevel",
        related_name="course_access",
        blank=True,
        help_text="Users who can access the course when visibility is set to PRIVATE",
    )
    metadata = models.JSONField(default=dict, blank=True)
    created_on = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=False)
    image = models.ImageField(upload_to="Images/", blank=True)  # no default

    def __str__(self):
        return self.title

    objects = CourseQuerySet.as_manager()


class Section(models.Model):
    badge = models.OneToOneField(
        Badge, on_delete=models.SET_NULL, null=True, related_name="section"
    )
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="sections"
    )
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=255)
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_sections",
    )
    visibility = models.CharField(
        max_length=50, choices=VisibilityLevel, default=VisibilityLevel.PRIVATE
    )
    access_users = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through="UserSectionAccessLevel",
        related_name="section_access",
        blank=True,
        help_text="Users who can access the section when visibility is set to PRIVATE",
    )
    number_of_problems = models.IntegerField(default=0)
    metadata = models.JSONField(default=dict, blank=True)
    created_on = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=False)
    image = models.ImageField(upload_to="Images/", blank=True)  # no default

    def __str__(self):
        return f"{self.course.title if self.course else 'No Course'} - {self.title}"

    objects = SectionQuerySet.as_manager()


class Room(models.Model):
    badge = models.OneToOneField(
        Badge, on_delete=models.SET_NULL, null=True, blank=True, related_name="room"
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="rooms")
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name="rooms")
    title = models.CharField(max_length=100)
    can_edit = models.BooleanField(default=True)
    description = models.CharField(max_length=255)
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_rooms",
    )
    visibility = models.CharField(
        max_length=50, choices=VisibilityLevel, default=VisibilityLevel.PRIVATE
    )
    access_users = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through="UserRoomAccessLevel",
        related_name="room_access",
        blank=True,
        help_text="Users who can access the room when visibility is set to PRIVATE",
    )
    number_of_problems = models.IntegerField(default=0)
    metadata = models.JSONField(default=dict, blank=True)
    created_on = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=False)
    image = models.ImageField(upload_to="Images/", blank=True)  # no default

    def __str__(self):
        return f"{self.course.title if self.course else 'No Course'} - {self.title}"

    objects = RoomQuerySet.as_manager()


class Tag(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Task(OrderedModel):
    room = models.ForeignKey(
        Room, on_delete=models.CASCADE, null=True, related_name="tasks"
    )
    tags = models.ManyToManyField(Tag)
    created_on = models.DateTimeField(auto_now_add=True)

    order_with_respect_to = (
        "room"  # this creates a 'order' int column in the model table
    )

    def __str__(self):
        return f"{self.room.title if self.room else 'No Room'} - {self.pk}"


class TaskComponentType(models.TextChoices):
    OPTION = "OPTION", _("MULTIPLE CHOICE OPTION")
    IMAGE = "IMAGE", _("IMAGE")
    TEXT = "TEXT", _("TEXT")
    FILL = "FILL", _("FILL IN THE BLANK QUESTION")
    # will add more or change labels as needed


class TaskComponent(OrderedModel):
    task = models.ForeignKey(
        Task, on_delete=models.CASCADE, null=True, related_name="components"
    )
    type = models.CharField(max_length=50, choices=TaskComponentType)
    # TODO: make it a image field if content is an image
    content = models.JSONField(
        default=dict, blank=True
    )  # the format of this JSON will depend on the TaskComponent.type
    created_on = models.DateTimeField(auto_now_add=True)

    order_with_respect_to = (
        "task"  # this creates a 'order' int column in the model table
    )

    def __str__(self):
        return f"{self.task} - {self.type}"


class UserCourseAccessLevel(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True)
    access_level = models.CharField(
        max_length=50, choices=AccessLevel, default=AccessLevel.VISITOR
    )

    def __str__(self):
        return f"{self.user.username if self.user else 'Unknown'} → {self.course.title if self.course else 'No Course'} ({self.access_level})"


class UserSectionAccessLevel(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True
    )
    section = models.ForeignKey(Section, on_delete=models.CASCADE, null=True)
    access_level = models.CharField(
        max_length=50, choices=AccessLevel, default=AccessLevel.VISITOR
    )

    def __str__(self):
        return f"{self.user.username if self.user else 'Unknown'} → {self.section.title if self.section else 'No Section'} ({self.access_level})"


class UserRoomAccessLevel(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True
    )
    room = models.ForeignKey(Room, on_delete=models.CASCADE, null=True)
    access_level = models.CharField(
        max_length=50, choices=AccessLevel, default=AccessLevel.VISITOR
    )

    def __str__(self):
        return f"{self.user.username if self.user else 'Unknown'} → {self.room.title if self.room else 'No Room'} ({self.access_level})"


class Status(models.TextChoices):
    NOSTAR = "NOSTAR", _("NOT STARTED")
    INCOMP = "INCOMP", _("INCOMPLETE")
    COMPLE = "COMPLE", _("COMPLETED")


class ProgressOfTask(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True
    )
    task = models.ForeignKey(Task, on_delete=models.CASCADE, null=True)
    status = models.CharField(max_length=50, choices=Status, default=Status.NOSTAR)
    attempts = models.IntegerField(default=0)
    metadata = models.JSONField(default=dict, blank=True)

    def __str__(self):
        # Safely resolve room title from task if available
        room_title = "No Room"
        try:
            if (
                self.task
                and getattr(self.task, "room", None)
                and getattr(self.task.room, "title", None)
            ):
                room_title = self.task.room.title
        except Exception:
            room_title = "No Room"

        return f"{self.user.username if self.user else 'Unknown'} → {room_title} ({self.status})"


class SavedTask(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True)
    section = models.ForeignKey(Section, on_delete=models.CASCADE, null=True)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, null=True)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, null=True)
    status = models.CharField(max_length=50, choices=Status, default=Status.NOSTAR)
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
