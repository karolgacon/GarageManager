from rest_framework.routers import DefaultRouter
from .view_collection.user_view import UsersAPIView
from .view_collection.profile_view import ProfileAPIView
from .view_collection.loginHistoryView import LoginHistoryViewAPI
from .view_collection.LoyaltyProgramView import LoyaltyProgramViewAPI
from .view_collection.adminView import AdminViewSet
from .view_collection.ownerView import OwnerViewSet
from .view_collection.mechanicView import MechanicViewSet

router = DefaultRouter()
router.register(r'users', UsersAPIView)
router.register(r'profiles', ProfileAPIView)
router.register(r'login-history', LoginHistoryViewAPI)
router.register(r'loyalty-program', LoyaltyProgramViewAPI)
router.register(r'admin', AdminViewSet)
router.register(r'owner', OwnerViewSet)
router.register(r'mechanic', MechanicViewSet)

urlpatterns = router.urls
