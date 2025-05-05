from ..services.notificationService import NotificationService
from ..serializers import NotificationSerializer
from backend.views_collection.BaseView import BaseViewSet

class NotificationViewSet(BaseViewSet):
    service = NotificationService
    serializer_class = NotificationSerializer
