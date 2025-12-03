from django.urls import path
from . import views

urlpatterns = [
    path("search_dict/", views.search_dict),
    path("pos/", views.get_all_pos),
    path("sources/", views.get_all_sources),
]