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
    def get_due_maintenance_schedules(cls, client_id=None):
        """
        Pobiera harmonogramy przeglądów, które są zaległe.
        Opcjonalnie filtruje po ID klienta, jeśli zostało podane.
        """
        query = cls.model.objects.filter(next_due_date__lte=date.today())
        
        if client_id is not None:
            # Filter by vehicles belonging to the client
            query = query.filter(vehicle__client_id=client_id)
            
        return query

    @classmethod
    def get_maintenance_schedule_by_client(cls, client_id):
        """
        Pobiera harmonogram przeglądów dla wszystkich pojazdów danego klienta.
        """
        if client_id is None:
            return cls.model.objects.none()
            
        return cls.model.objects.filter(vehicle__client_id=client_id)