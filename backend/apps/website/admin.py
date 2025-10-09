from django.contrib import admin
from .models import *

admin.site.register(Course)
admin.site.register(Section)
admin.site.register(Room)
admin.site.register(Task)
admin.site.register(TaskComponent)
admin.site.register(UserCourseAccessLevel)
admin.site.register(UserSectionAccessLevel)
admin.site.register(ProgressOfTask)
admin.site.register(Tag)
admin.site.register(SavedTask)
admin.site.register(Dictionary)
admin.site.register(DictionaryEntry)