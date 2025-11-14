from django.urls import path
from . import views

urlpatterns = [
    # course apis
    path("courses/create_course/", views.create_course),
    path("courses/", views.get_courses),
    path("courses/<int:course_id>/delete/", views.delete_course),
    # section apis
    path("courses/<int:course_id>/create_section/", views.create_section),
    path("courses/<int:course_id>/sections/", views.get_sections),
    path("courses/<int:course_id>/sections/<int:section_id>/delete/", views.delete_section),
    # room apis
    path("courses/<int:course_id>/sections/<int:section_id>/create_room/", views.create_room),
    path("courses/<int:course_id>/sections/<int:section_id>/rooms/", views.get_rooms),
    path("courses/<int:course_id>/sections/<int:section_id>/rooms/<int:room_id>/delete/", views.delete_room),
    path("courses/<int:course_id>/sections/<int:section_id>/rooms/<int:room_id>/", views.get_room),
    path("courses/<int:course_id>/sections/<int:section_id>/rooms/<int:room_id>/save/", views.save_room),
    path("courses/<int:course_id>/sections/<int:section_id>/rooms/<int:room_id>/publish/", views.publish_room),
]