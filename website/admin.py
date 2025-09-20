from django.contrib import admin
from .models import (
    User, Course, Section, ProblemSet,
    PointElement, PointlessElement,
    UserCourseAccessLevel, UserSectionAccessLevel,
    ProgressOfProblem, Tag, SavedProblem, 
    Dictionary, DictionaryEntry
)

admin.site.register(User)
admin.site.register(Course)
admin.site.register(Section)
admin.site.register(ProblemSet)
admin.site.register(PointElement)
admin.site.register(PointlessElement)
admin.site.register(UserCourseAccessLevel)
admin.site.register(UserSectionAccessLevel)
admin.site.register(ProgressOfProblem)
admin.site.register(Tag)
admin.site.register(SavedProblem)
admin.site.register(Dictionary)
admin.site.register(DictionaryEntry)