from rest_framework.routers import DefaultRouter
from .views_collection.ServiceView import ServiceViewSet
from .views_collection.WorkshopView import WorkshopViewSet
from .views_collection.WorkshopMechanicView import WorkshopMechanicViewSet
from .views_collection.ReportView import ReportViewSet

router = DefaultRouter()

router.register(r'workshops', WorkshopViewSet)
router.register(r'services', ServiceViewSet)
router.register(r'mechanics', WorkshopMechanicViewSet)
router.register(r'reports', ReportViewSet)

urlpatterns = router.urls