from ..models import AuditLog
from backend.repositories.baseRepository import BaseRepository

class AuditLogRepository(BaseRepository):
    model = AuditLog
