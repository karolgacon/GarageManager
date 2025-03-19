from rest_framework.routers import DefaultRouter
from .view_collection.user_view import UsersAPIView
from .view_collection.profile_view import ProfileAPIView

router = DefaultRouter()
router.register(r'users', UsersAPIView)
router.register(r'profiles', ProfileAPIView)

urlpatterns = router.urls
