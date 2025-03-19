from django.urls import path
from .view_collection.user_view import UserViewAPI
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView
from .view_collection.authView import CreateUserView

urlpatterns = [
    path('user/', UserViewAPI.as_view(), name='user'),
    path('token/refresh/', TokenRefreshView.as_view(), name='refresh-token'),
    path('token/', TokenObtainPairView.as_view(), name='token-obtain'),
    path("user/register/", CreateUserView.as_view(), name="register"),
]
