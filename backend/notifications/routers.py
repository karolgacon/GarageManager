from rest_framework.routers import DefaultRouter
from .views_collection.NotificationView import NotificationViewSet
from .views_collection.AuditLogView import AuditLogViewSet

router = DefaultRouter()

router.register(r'notifications', NotificationViewSet)
router.register(r'auditlogs', AuditLogViewSet)

urlpatterns = router.urls