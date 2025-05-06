from rest_framework.routers import DefaultRouter
from .view_collection.user_view import UserViewSet
from .view_collection.profile_view import ProfileViewSet
from .view_collection.loginHistoryView import LoginHistoryViewSet
from .view_collection.LoyaltyProgramView import LoyaltyProgramViewSet
from .view_collection.adminView import AdminViewSet
from .view_collection.ownerView import OwnerViewSet
from .view_collection.mechanicView import MechanicViewSet

router = DefaultRouter()

# Register ViewSets
router.register(r'users', UserViewSet, basename='users')
router.register(r'profiles', ProfileViewSet, basename='profiles')
router.register(r'login-history', LoginHistoryViewSet, basename='login-history')
router.register(r'loyalty-program', LoyaltyProgramViewSet, basename='loyalty-program')
router.register(r'admin', AdminViewSet, basename='admin')
router.register(r'owner', OwnerViewSet, basename='owner')
router.register(r'mechanic', MechanicViewSet, basename='mechanic')

urlpatterns = router.urls