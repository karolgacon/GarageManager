from rest_framework.routers import DefaultRouter
from .views_collection.ServiceView import ServiceViewSet
from .views_collection.WorkshopView import WorkshopViewSet

router = DefaultRouter()
router.register(r'services', ServiceViewSet)
router.register(r'workshops', WorkshopViewSet)

urlpatterns = router.urls