from rest_framework.routers import DefaultRouter
from .view_collection.user_view import UsersAPIView

router = DefaultRouter()
router.register(r'users', UsersAPIView)

urlpatterns = router.urls
