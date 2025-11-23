from django.urls import path
from . import views
from rest_framework_simplejwt.views import (TokenObtainPairView, TokenRefreshView, TokenVerifyView)


urlpatterns = [
    #account
    path('signup/', views.signup_user, name='signup'),
    path('delete-account/', views.delete_account, name='delete_account'),
    #JWT Tokens
    path('token/', TokenObtainPairView.as_view(), name='get_token'),
    path('token/refresh', TokenRefreshView.as_view(), name='refresh_token'),
    path('token/verify', TokenVerifyView.as_view(), name='verify_token'),
    # user info
    path("user_info/", views.get_user_info),
    path("update_user_info/", views.update_user_info),
    path("another_user_info/<str:user_username>", views.get_another_user_info),
]