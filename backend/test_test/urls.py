from django.urls import path
from . import views

urlpatterns = [
    path("todos/", views.get_todos, name="get_all_todos"),
    path("todos/create_todo/", views.create_todos, name="create_todos"),
    path("todos/<int:pk>/", views.todo_detail, name="todos_detail")
]