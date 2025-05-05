from ..services.auditLogService import AuditLogService
from ..serializers import AuditLogSerializer
from backend.views_collection.BaseView import BaseViewSet as baseViewSet

class AuditLogViewSet(baseViewSet):
    serializer_class = AuditLogSerializer
    service = AuditLogService