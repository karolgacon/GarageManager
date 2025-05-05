from ..models import Notification
from backend.repositories.baseRepository import BaseRepository

class NotificationRepository(BaseRepository):
    model = Notification