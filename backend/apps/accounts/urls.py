from django.urls import path
from rest_framework_simplejwt.views import (TokenObtainPairView, TokenRefreshView, TokenVerifyView)
from .views import *


urlpatterns = [
    #account
    path('signup/', signup_user, name='signup'),
    path('delete-account/', delete_account, name='delete_account'),
    #JWT Tokens
    path('token/', TokenObtainPairView.as_view(), name='get_token'),
    path('token/refresh', TokenRefreshView.as_view(), name='refresh_token'),
    path('token/verify', TokenVerifyView.as_view(), name='verify_token'),
    # user info
    path("user_info/", get_user_info),
    path("update_user_info/", update_user_info),
    path("another_user_info/<str:user_username>", get_another_user_info),
    path("all_users", all_users),
    # user courses info
    path("courses_created/<str:user_username>", get_courses_created),
    path("courses_completed/<str:user_username>", get_courses_completed),
    # friendship stuff
    path("users/", view=all_users, name="friendship_view_users"),
    path(
        "friends/<slug:username>/",
        view=view_friends,
        name="friendship_view_friends",
    ),
    path(
        "friend/add/<slug:to_username>/",
        view=friendship_add_friend,
        name="friendship_add_friend",
    ),
    path(
        "friend/accept/<int:friendship_request_id>/",
        view=friendship_accept,
        name="friendship_accept",
    ),
    path(
        "friend/reject/<int:friendship_request_id>/",
        view=friendship_reject,
        name="friendship_reject",
    ),
    path(
        "friend/cancel/<int:friendship_request_id>/",
        view=friendship_cancel,
        name="friendship_cancel",
    ),
    path(
        "friend/requests/",
        view=friendship_request_list,
        name="friendship_request_list",
    ),
    path(
        "friend/requests/rejected/",
        view=friendship_request_list_rejected,
        name="friendship_requests_rejected",
    ),
    path(
        "friend/request/<int:friendship_request_id>/",
        view=friendship_requests_detail,
        name="friendship_requests_detail",
    ),
    path(
        "followers/<slug:username>/",
        view=followers,
        name="friendship_followers",
    ),
    path(
        "following/<slug:username>/",
        view=following,
        name="friendship_following",
    ),
    path(
        "follower/add/<slug:followee_username>/",
        view=follower_add,
        name="follower_add",
    ),
    path(
        "follower/remove/<slug:followee_username>/",
        view=follower_remove,
        name="follower_remove",
    ),
    path(
        "blockers/<slug:username>/",
        view=blockers,
        name="friendship_blockers",
    ),
    path(
        "blocking/<slug:username>/",
        view=blocking,
        name="friendship_blocking",
    ),
    path(
        "block/add/<slug:blocked_username>/",
        view=block_add,
        name="block_add",
    ),
    path(
        "block/remove/<slug:blocked_username>/",
        view=block_remove,
        name="block_remove",
    ),
    path(
        "friend/requests/sent/",
        view=pending_friend_requests,
        name="pending_friend_requests"
    ),
    path('friend/remove/<slug:username>/', remove_friend, name='remove_friend'),
    path("search/", search_users, name="search_users"),
]