from ..repositories.auditLogRepository import AuditLogRepository
from backend.services.baseService import BaseService

class AuditLogService(BaseService):
    repository = AuditLogRepository