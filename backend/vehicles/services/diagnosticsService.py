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

    @classmethod
    def get_diagnostics_by_vehicle(cls, vehicle_id):
        """
        Pobiera diagnostykę powiązaną z danym pojazdem.
        """
        return cls.repository.get_diagnostics_by_vehicle(vehicle_id)