from django.contrib import admin
from .models import *
import nested_admin

admin.site.register(ProgressOfTask)
admin.site.register(SavedTask)
admin.site.register(Badge)
admin.site.register(UserBadge)
admin.site.register(Tag)
admin.site.register(Report)

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

# Admin actions for PublishableMixin objects
def approve_selected(modeladmin, request, queryset):
    for obj in queryset:
        obj.approve_publish()
approve_selected.short_description = "Approve selected Pending objects"

def reject_selected(modeladmin, request, queryset):
    for obj in queryset:
        obj.reject_publish()
reject_selected.short_description = "Reject selected Pending objects"

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("title", "creator", "visibility", "is_published", "created_on")
    list_filter = ["visibility"]
    actions = [approve_selected, reject_selected]

@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ("title", "course", "creator", "visibility", "is_published", "created_on")
    list_filter = ["visibility"]
    actions = [approve_selected, reject_selected]

@admin.register(Room)
class RoomAdmin(nested_admin.NestedModelAdmin):
    list_display = ("title", "course", "visibility","section", "creator", "visibility", "is_published", "can_edit", "created_on")
    list_filter = ["visibility"]
    actions = [approve_selected, reject_selected]
    inlines = [TaskInline]