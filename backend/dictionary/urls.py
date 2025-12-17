from django.urls import path
from . import views

urlpatterns = [
    path("pos/", views.get_all_pos),
    path("sources/", views.get_all_sources),
    path("headwords/", views.get_headwords),
    path("headwords/<str:term>/data", views.get_term_data),
    path("headwords/<str:term>/exact/data", views.get_term_exact_data),
    path("n_words/", views.get_n_terms)
]