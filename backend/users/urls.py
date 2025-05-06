from django.urls import path
from .routers import router
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView
from .view_collection.authView import CreateUserView, LoginView

urlpatterns = [
    # JWT Authentication endpoints
    path('token/', TokenObtainPairView.as_view(), name='token-obtain'),
    path('token/refresh/', TokenRefreshView.as_view(), name='refresh-token'),

    # Include all registered ViewSets from the router
    path('', include(router.urls)),

    # Additional endpoints (if needed)
    path('user/register/', CreateUserView.as_view(), name='user-register'),
    path('user/login/', LoginView.as_view(), name='user-login'),
]