from ..repositories.repairJobsRepository import RepairJobRepository
from backend.services.baseService import BaseService

class RepairJobService(BaseService):
    repository = RepairJobRepository

    @staticmethod
    def get_repair_jobs_by_appointment(appointment_id):
        """
        Retrieves all repair jobs associated with a specific appointment.
        """
        try:
            return RepairJobRepository.get_repair_jobs_by_appointment(appointment_id)
        except Exception as e:
            raise RuntimeError(f"Error retrieving repair jobs for appointment {appointment_id}: {str(e)}")

    @staticmethod
    def get_repair_jobs_by_mechanic(mechanic_id):
        """
        Retrieves all repair jobs assigned to a specific mechanic.
        """
        try:
            return RepairJobRepository.get_repair_jobs_by_mechanic(mechanic_id)
        except Exception as e:
            raise RuntimeError(f"Error retrieving repair jobs for mechanic {mechanic_id}: {str(e)}")