from django.urls import path, include
from .view_collection.user_view import UserViewAPI

urlpatterns = [
    path('user/', UserViewAPI.as_view(), name='user'),
]
