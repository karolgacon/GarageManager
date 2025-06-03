from backend.services.baseService import BaseService
from ..repositories.maintenanceScheduleRepository import MaintenanceScheduleRepository

class MaintenanceScheduleService(BaseService):
    repository = MaintenanceScheduleRepository

    @classmethod
    def get_maintenance_schedule_by_vehicle(cls, vehicle_id):
        """
        Pobiera harmonogram przeglądów dla danego pojazdu.
        """
        return cls.repository.get_maintenance_schedule_by_vehicle(vehicle_id)

    @classmethod
    def get_due_maintenance_schedules(cls, client_id=None):
        """
        Pobiera harmonogramy przeglądów, które są zaległe.
        Opcjonalnie filtruje po ID klienta, jeśli zostało podane.
        """
        return cls.repository.get_due_maintenance_schedules(client_id)

    @classmethod
    def get_maintenance_schedule_by_client(cls, client_id):
        """
        Pobiera harmonogram przeglądów dla wszystkich pojazdów danego klienta.
        """
        return cls.repository.get_maintenance_schedule_by_client(client_id)