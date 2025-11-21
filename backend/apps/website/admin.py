from django.contrib import admin
from .models import *
import nested_admin
from django.contrib.auth import get_user_model

User = get_user_model()

admin.site.register(User)
admin.site.register(Course)
admin.site.register(Section)
admin.site.register(TaskComponent)
admin.site.register(UserCourseAccessLevel)
admin.site.register(UserSectionAccessLevel)
admin.site.register(UserRoomAccessLevel)
admin.site.register(ProgressOfTask)
admin.site.register(Tag)
admin.site.register(SavedTask)
admin.site.register(Dictionary)
admin.site.register(DictionaryEntry)
admin.site.register(Badge)
admin.site.register(UserBadge)

class TaskComponentInline(nested_admin.NestedTabularInline):
    model = TaskComponent
    extra = 1 # num of extra forms to show

class TaskInline(nested_admin.NestedStackedInline):
    model = Task
    extra = 1 # num of extra forms to show
    inlines = [TaskComponentInline]

@admin.register(Task)
class TaskAdmin(nested_admin.NestedModelAdmin):
    inlines = [TaskComponentInline]

@admin.register(Room)
class RoomAdmin(nested_admin.NestedModelAdmin):
    inlines = [TaskInline]