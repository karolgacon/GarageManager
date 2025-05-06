from backend.services.baseService import BaseService
from ..repositories.diagnosticsRepository import DiagnosticsRepository

class DiagnosticsService(BaseService):
    repository = DiagnosticsRepository

    @classmethod
    def get_critical_diagnostics(cls):
        """
        Pobiera diagnostykę oznaczoną jako krytyczną.
        """
        return cls.repository.get_critical_diagnostics()