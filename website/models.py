from django.db import models
from django.utils.translation import gettext_lazy as _

__all__ = [
    "User",
    "Course",
    "Section",
    "ProblemSet",
    "PointElement",
    "PointlessElement",
    "UserCourseAccessLevel",
    "UserSectionAccessLevel",
    "ProgressOfProblem",
    "Tag",
    "SavedProblem",
    "Dictionary",
    "DictionaryEntry",
]

class AccessLevel(models.TextChoices):
    ADMIN = "AD", _("ADMIN")
    VISITOR = "VI", _("VISITOR")


class User(models.Model):
    username = models.CharField(max_length=100)
    email = models.EmailField(max_length=200)
    password = models.CharField(max_length=100)
    date_of_creation = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.username


class VisibilityLevel(models.TextChoices):
    PRIVATE = "PRI", _("PRIVATE")   # devs only
    PUBLIC = "PUB", _("PUBLIC")     # available on web
    LIMITER = "LIM", _("LIMITER")   # certain users only


class Course(models.Model):
    title = models.CharField(max_length=50)
    description = models.CharField(max_length=200)
    creator = models.ForeignKey(
        User, on_delete=models.CASCADE, null=True, related_name="created_courses"
    )
    visibility = models.CharField(
        max_length=50,
        choices=VisibilityLevel,
        default=VisibilityLevel.PUBLIC
    )
    access_users = models.ManyToManyField(
        User,
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


class Section(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.SET_NULL,
        null=True,
        related_name="sections"
    )
    title = models.CharField(max_length=50)
    description = models.CharField(max_length=200)
    creator = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="created_sections"
    )
    visibility = models.CharField(
        max_length=50,
        choices=VisibilityLevel,
        default=VisibilityLevel.PUBLIC
    )
    access_users = models.ManyToManyField(
        User,
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


class ProblemSet(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.SET_NULL,
        null=True,
        related_name="problemsets"
    )
    section = models.ForeignKey(
        Section,
        on_delete=models.SET_NULL,
        null=True,
        related_name="problemsets"
    )
    title = models.CharField(max_length=50)
    description = models.CharField(max_length=200)
    creator = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="created_problemsets"
    )
    number_of_problems = models.IntegerField(default=0)
    metadata = models.JSONField(default=dict, blank=True)
    created_on = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.course.title if self.course else 'No Course'} - {self.title}"


class ProblemType(models.TextChoices):
    MCQ = "MCQ", _("MULTIPLE CHOICE QUESTION")
    FREERESP = "FREE", _("FREE RESPONSE QUESTION")
    # More types can be added later


class PointlessElement(models.Model):
    problemset = models.ForeignKey(
        ProblemSet,
        on_delete=models.SET_NULL,
        null=True,
        related_name="pointless_elements"
    )
    content = models.JSONField(default=dict, blank=True)
    interface_data = models.JSONField(default=dict, blank=True)
    created_on = models.DateTimeField(auto_now_add=True)


class Tag(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class PointElement(models.Model):
    problemset = models.ForeignKey(
        ProblemSet,
        on_delete=models.SET_NULL,
        null=True,
        related_name="point_elements"
    )
    content = models.JSONField(default=dict, blank=True)
    type = models.CharField(
        max_length=50,
        choices=ProblemType
    )
    tags = models.ManyToManyField(Tag)
    point_value = models.IntegerField(default=1)
    interface_data = models.JSONField(default=dict, blank=True)
    created_on = models.DateTimeField(auto_now_add=True)


class UserCourseAccessLevel(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True)
    access_level = models.CharField(
        max_length=50,
        choices=AccessLevel,
        default=AccessLevel.VISITOR
    )

    def __str__(self):
        return f"{self.user.username if self.user else 'Unknown'} → {self.course.title if self.course else 'No Course'} ({self.access_level})"


class UserSectionAccessLevel(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True)
    section = models.ForeignKey(Section, on_delete=models.SET_NULL, null=True)
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


class ProgressOfProblem(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True)
    section = models.ForeignKey(Section, on_delete=models.SET_NULL, null=True)
    problemset = models.ForeignKey(ProblemSet, on_delete=models.SET_NULL, null=True)
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
        return f"{self.user.username if self.user else 'Unknown'} → {self.problemset.title if self.problemset else 'No ProblemSet'} ({self.status})"

class SavedProblem(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True)
    section = models.ForeignKey(Section, on_delete=models.SET_NULL, null=True)
    problemset = models.ForeignKey(ProblemSet, on_delete=models.SET_NULL, null=True)
    pointelement = models.ForeignKey(PointElement, on_delete=models.SET_NULL, null=True)
    status = models.CharField(
        max_length=50,
        choices=Status,
        default=Status.NOSTAR
    )
    saved_at = models.DateTimeField()
    metadata = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.user.username if self.user else 'Unknown'} → {self.pointelement if self.pointelement else 'No Saved Problems'} ({self.status})"

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