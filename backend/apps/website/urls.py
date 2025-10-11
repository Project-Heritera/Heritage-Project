from django.urls import path
from . import views

urlpatterns = [
    path("courses/<int:course_id>/sections/<int:section_id>/create_room/", views.create_room),
    path("courses/<int:course_id>/sections/<int:section_id>/rooms/<int:room_id>/", views.get_room),
    path("courses/<int:course_id>/sections/<int:section_id>/rooms/<int:room_id>/save/", views.save_room),
    path("courses/<int:course_id>/sections/<int:section_id>/rooms/<int:room_id>/publish/", views.publish_room),
]