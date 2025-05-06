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
    def get_due_maintenance_schedules(cls):
        """
        Pobiera harmonogramy przeglądów, które są zaległe.
        """
        return cls.repository.get_due_maintenance_schedules()