from backend.repositories.baseRepository import BaseRepository
from ..models import Diagnostics

class DiagnosticsRepository(BaseRepository):
    model = Diagnostics

    @classmethod
    def get_diagnostics_by_vehicle(cls, vehicle_id):
        """
        Pobiera diagnostykę powiązaną z danym pojazdem.
        """
        return cls.model.objects.filter(vehicle_id=vehicle_id)

    @classmethod
    def get_critical_diagnostics(cls):
        """
        Pobiera diagnostykę oznaczoną jako krytyczną.
        """
        return cls.model.objects.filter(severity_level='critical')