from rest_framework.routers import DefaultRouter
from .views_collection.ServiceView import ServiceViewSet
from .views_collection.WorkshopView import WorkshopViewSet
from .views_collection.WorkshopMechanicView import WorkshopMechanicViewSet
from .views_collection.ReportView import ReportViewSet

router = DefaultRouter()

router.register(r'workshops', WorkshopViewSet, basename='workshop')
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'mechanics', WorkshopMechanicViewSet, basename='workshop-mechanic')
router.register(r'reports', ReportViewSet, basename='report')

urlpatterns = router.urls