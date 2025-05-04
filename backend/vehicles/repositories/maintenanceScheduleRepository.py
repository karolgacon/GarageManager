from ..models import MaintenanceSchedule

class MaintenanceScheduleRepository:
    @staticmethod
    def get_all_maintenance_schedules():
        return MaintenanceSchedule.objects.all()
    
    @staticmethod
    def create_maintenance_schedule(data):
        """
        Creates a new maintenance schedule in the database.
        """
        return MaintenanceSchedule.objects.create(**data)

    @staticmethod
    def get_maintenance_schedule_by_vehicle(vehicle_id):
        return MaintenanceSchedule.objects.filter(vehicle_id=vehicle_id)

    @staticmethod
    def get_due_maintenance_schedules():
        from datetime import date
        return MaintenanceSchedule.objects.filter(next_due_date__lte=date.today())

    @staticmethod
    def get_maintenance_schedule_by_id(schedule_id):
        return MaintenanceSchedule.objects.filter(id=schedule_id).first()

    @staticmethod
    def delete_maintenance_schedule(schedule_id):
        schedule = MaintenanceSchedule.objects.filter(id=schedule_id).first()
        if schedule:
            schedule.delete()
            return True
        return False