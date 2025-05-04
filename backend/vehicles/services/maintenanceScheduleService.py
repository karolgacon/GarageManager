from ..repositories.maintenanceScheduleRepository import MaintenanceScheduleRepository

class MaintenanceScheduleService:
    @staticmethod
    def get_maintenance_schedule_by_vehicle(vehicle_id):
        return MaintenanceScheduleRepository.get_maintenance_schedule_by_vehicle(vehicle_id)
    
    @staticmethod
    def add_maintenance_schedule(data):
        """
        Adds a new maintenance schedule using the provided data.
        """
        schedule = MaintenanceScheduleRepository.create_maintenance_schedule(data)
        return schedule

    @staticmethod
    def add_maintenance_schedule(vehicle, service_type, recommended_date, mileage_interval):
        return MaintenanceScheduleRepository.create_maintenance_schedule(
            vehicle=vehicle,
            service_type=service_type,
            recommended_date=recommended_date,
            mileage_interval=mileage_interval
        )

    @staticmethod
    def update_maintenance_schedule(schedule_id, **kwargs):
        schedule = MaintenanceScheduleRepository.get_maintenance_schedule_by_id(schedule_id)
        if not schedule:
            return None
        for key, value in kwargs.items():
            if hasattr(schedule, key):
                setattr(schedule, key, value)
        schedule.save()
        return schedule

    @staticmethod
    def get_due_maintenance_schedules():
        return MaintenanceScheduleRepository.get_due_maintenance_schedules()

    @staticmethod
    def delete_maintenance_schedule(schedule_id):
        return MaintenanceScheduleRepository.delete_maintenance_schedule(schedule_id)