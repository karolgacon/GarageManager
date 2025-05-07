from backend.services.baseService import BaseService
from ..repositories.reportRepository import ReportRepository

class ReportService(BaseService):
    repository = ReportRepository