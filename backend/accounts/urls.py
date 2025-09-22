from django.urls import path
from . import views


urlpatterns = [
    path('login_user/', views.login_user, name='login'),
    path('signup_user/',views.signup_user, name='signup'),
    path('logout/', views.logout_user, name='logout_user'),
    path('change-password/', views.change_password, name='change_password'),
    path('delete-account/', views.delete_account, name='delete_account'),
]