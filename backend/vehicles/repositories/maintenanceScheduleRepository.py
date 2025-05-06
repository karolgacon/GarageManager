from backend.repositories.baseRepository import BaseRepository
from ..models import MaintenanceSchedule
from datetime import date

class MaintenanceScheduleRepository(BaseRepository):
    model = MaintenanceSchedule

    @classmethod
    def get_maintenance_schedule_by_vehicle(cls, vehicle_id):
        """
        Pobiera harmonogram przeglądów dla danego pojazdu.
        """
        return cls.model.objects.filter(vehicle_id=vehicle_id)

    @classmethod
    def get_due_maintenance_schedules(cls):
        """
        Pobiera harmonogramy przeglądów, które są zaległe.
        """
        return cls.model.objects.filter(next_due_date__lte=date.today())