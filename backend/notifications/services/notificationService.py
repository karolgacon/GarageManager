from ..repositories.notificationRepository import NotificationRepository
from backend.services.baseService import BaseService

class NotificationService(BaseService):
    repository = NotificationRepository
