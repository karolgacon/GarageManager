from django.http import Http404
from django.forms import ValidationError
from ..repositories.repairJobsRepository import RepairJobRepository

class RepairJobService:
    @staticmethod
    def get_all_repair_jobs():
        """
        Retrieves all repair jobs from the database.
        """
        try:
            return RepairJobRepository.get_all_repair_jobs()
        except Exception as e:
            raise RuntimeError(f"Error retrieving repair jobs: {str(e)}")

    @staticmethod
    def create_repair_job(data):
        """
        Creates a new repair job in the database.
        """
        try:
            # Example validation logic
            if data.get('start_date') > data.get('end_date'):
                raise ValidationError("End date cannot be earlier than the start date")
            return RepairJobRepository.create_repair_job(data)
        except ValidationError as e:
            raise ValidationError({"error": str(e)})
        except Exception as e:
            raise RuntimeError(f"Error creating repair job: {str(e)}")

    @staticmethod
    def get_repair_job_by_id(repair_job_id):
        """
        Retrieves a repair job by its ID.
        """
        try:
            return RepairJobRepository.get_repair_job_by_id(repair_job_id)
        except ValueError as e:
            raise Http404(str(e))
        except Exception as e:
            raise RuntimeError(f"Error retrieving repair job: {str(e)}")

    @staticmethod
    def delete_repair_job(repair_job_id):
        """
        Deletes a repair job by its ID.
        """
        try:
            return RepairJobRepository.delete_repair_job(repair_job_id)
        except ValueError as e:
            raise Http404(str(e))
        except Exception as e:
            raise RuntimeError(f"Error deleting repair job: {str(e)}")

    @staticmethod
    def update_repair_job(repair_job_id, data):
        """
        Updates an existing repair job.
        """
        try:
            return RepairJobRepository.update_repair_job(repair_job_id, data)
        except ValueError as e:
            raise Http404(str(e))
        except Exception as e:
            raise RuntimeError(f"Error updating repair job: {str(e)}")

    @staticmethod
    def partially_update_repair_job(repair_job_id, data):
        """
        Partially updates an existing repair job.
        """
        try:
            return RepairJobRepository.partially_update_repair_job(repair_job_id, data)
        except ValueError as e:
            raise Http404(str(e))
        except Exception as e:
            raise RuntimeError(f"Error partially updating repair job: {str(e)}")

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