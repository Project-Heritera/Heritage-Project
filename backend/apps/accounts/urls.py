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
    path('token/verify', TokenVerifyView.as_view(), name='verify_token')
]