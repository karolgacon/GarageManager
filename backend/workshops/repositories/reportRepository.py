from backend.repositories.baseRepository import BaseRepository
from ..models import Report

class ReportRepository(BaseRepository):
    model = Report