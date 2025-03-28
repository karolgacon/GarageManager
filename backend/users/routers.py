from rest_framework.routers import DefaultRouter
from .view_collection.user_view import UsersAPIView
from .view_collection.profile_view import ProfileAPIView
from .view_collection.loginHistoryView import LoginHistoryViewAPI
from .view_collection.LoyaltyProgramView import LoyaltyProgramViewAPI

router = DefaultRouter()
router.register(r'users', UsersAPIView)
router.register(r'profiles', ProfileAPIView)
router.register(r'login-history', LoginHistoryViewAPI)
router.register(r'loyalty-program', LoyaltyProgramViewAPI)

urlpatterns = router.urls
