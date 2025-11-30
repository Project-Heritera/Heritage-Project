from django.urls import path
from . import views

urlpatterns = [
    # course apis
    path("courses/create_course/", views.create_course),
    path("courses/", views.get_courses),
    path("courses/<int:course_id>/progress/", views.get_course_progress),
    path("courses/<int:course_id>/delete/", views.delete_course),
    
    # section apis
    path("courses/<int:course_id>/create_section/", views.create_section),
    path("courses/<int:course_id>/sections/", views.get_sections),
    path("courses/<str:course_title>/sections/", views.get_sections_by_title),
    path("sections/<int:section_id>/progress/", views.get_section_progress),
    path("sections/<int:section_id>/delete/", views.delete_section),
    
    # room apis
    path("courses/<int:course_id>/sections/<int:section_id>/create_room/", views.create_room),
    path("sections/<int:section_id>/rooms/", views.get_rooms),
    path("sections/<str:section_title>/rooms/", views.get_rooms_by_title),
    path("rooms/<int:room_id>/progress/", views.get_room_progress),
    path("rooms/<int:room_id>/delete/", views.delete_room),
    path("rooms/<int:room_id>/", views.get_room),
    path("rooms/<int:room_id>/save/", views.save_room),
    path("rooms/<int:room_id>/publish/", views.publish_room),
    
    # task prog apis
    path("tasks/<int:task_id>/update_progress/", views.update_task_progress),
    path("courses/<int:course_id>/sections/<int:section_id>/rooms/<int:room_id>/task_progress/", views.get_task_progress_for_room,),
    
    # user badges api
    path("badges/", views.get_badges),
    path("another_badges/<str:user_username>", views.get_another_badges),
    path("badges/<int:badge_id>/award_badge/", views.award_badge),
    path("courses/search/", views.search_courses),

    # contribution apis
    path("add_as_editor/user/<slug:user_username>/room/<int:room_id>/", views.add_as_editor),
]
