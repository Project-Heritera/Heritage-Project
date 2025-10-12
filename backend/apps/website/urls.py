from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name="home"),
    path('join/', views.join, name="join"),
    # API for room editor
    path('api/elements/', views.ElementListAPIView.as_view(), name='api-elements-list'),
    path('api/elements/<int:pk>/', views.ElementDetailAPIView.as_view(), name='api-elements-detail'),
]