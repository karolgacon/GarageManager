from django.urls import path, include
from .view_collection.user_view import UserViewAPI
from .view_collection.refreshToken import RefreshTokenView
from .view_collection.authView import RegisterView, LoginView

urlpatterns = [
    path('user/', UserViewAPI.as_view(), name='user'),
    path('refresh-token/', RefreshTokenView.as_view(), name='refresh-token'),
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
]
