from django.urls import path
from .routers import router
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView
from .view_collection.authView import CreateUserView, LoginView, PublicUserDetailView

urlpatterns = [

    path('token/', TokenObtainPairView.as_view(), name='token-obtain'),
    path('token/refresh/', TokenRefreshView.as_view(), name='refresh-token'),

    path('', include(router.urls)),

    path('user/register/', CreateUserView.as_view(), name='user-register'),
    path('user/login/', LoginView.as_view(), name='user-login'),
    path('user/<int:id>/', PublicUserDetailView.as_view(), name='public-user-detail'),
]