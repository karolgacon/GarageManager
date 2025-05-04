from rest_framework.routers import DefaultRouter

from .views_collection.VehicleView import VehicleViewSet
from .views_collection.DiagnosticsView import DiagnosticsViewSet
from .views_collection.MaintenanceScheduleView import MaintenanceScheduleViewSet


router = DefaultRouter()

router.register(r'vehicles', VehicleViewSet , basename='vehicles')
router.register(r'diagnostics', DiagnosticsViewSet, basename='diagnostics')
router.register(r'maintenance-schedules', MaintenanceScheduleViewSet, basename='maintenance-schedules')

urlpatterns = router.urls