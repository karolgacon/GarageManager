from rest_framework.routers import DefaultRouter
from .views_collection.NotificationView import NotificationViewSet
from .views_collection.AuditLogView import AuditLogViewSet

router = DefaultRouter()

router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'auditlogs', AuditLogViewSet, basename='auditlog')

urlpatterns = router.urls