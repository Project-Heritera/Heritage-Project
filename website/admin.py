from django.contrib import admin
from .models import (
    User, Course, Section, ProblemSet,
    Element, UserCourseAccessLevel, UserSectionAccessLevel,
    ProgressOfElement, Tag, SavedProblem, 
    Dictionary, DictionaryEntry
)

admin.site.register(User)
admin.site.register(Course)
admin.site.register(Section)
admin.site.register(ProblemSet)
admin.site.register(Element)
admin.site.register(UserCourseAccessLevel)
admin.site.register(UserSectionAccessLevel)
admin.site.register(ProgressOfElement)
admin.site.register(Tag)
admin.site.register(SavedProblem)
admin.site.register(Dictionary)
admin.site.register(DictionaryEntry)