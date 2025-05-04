from ..models import RepairJob

class RepairJobRepository:

    @staticmethod
    def get_all_repair_jobs():
        """
        Retrieves all repair jobs from the database.
        """
        try:
            repair_jobs = RepairJob.objects.all()
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error retrieving repair jobs: {str(e)}")
        return repair_jobs
    
    @staticmethod
    def create_repair_job(data):
        """
        Creates a new repair job in the database.
        """
        try:
            repair_job = RepairJob.objects.create(**data)
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error creating repair job: {str(e)}")
        return repair_job
    
    @staticmethod
    def get_repair_job_by_id(repair_job_id):
        """
        Retrieves a repair job by its ID.
        """
        try:
            repair_job = RepairJob.objects.filter(id=repair_job_id).first()
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error retrieving repair job: {str(e)}")
        if not repair_job:
            raise ValueError(f"Repair job with ID {repair_job_id} does not exist.")
        return repair_job
    
    @staticmethod
    def delete_repair_job(repair_job_id):
        """
        Deletes a repair job by its ID.
        """
        try:
            repair_job = RepairJob.objects.filter(id=repair_job_id).first()
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error deleting repair job: {str(e)}")
        if not repair_job:
            raise ValueError(f"Repair job with ID {repair_job_id} does not exist.")
        repair_job.delete()
        return True
    
    @staticmethod
    def update_repair_job(repair_job_id, data):
        """
        Updates an existing repair job.
        """
        try:
            repair_job = RepairJob.objects.filter(id=repair_job_id).first()
            if not repair_job:
                raise ValueError(f"Repair job with ID {repair_job_id} does not exist.")
            for key, value in data.items():
                setattr(repair_job, key, value)
            repair_job.save()
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error updating repair job: {str(e)}")
        return repair_job
    
    @staticmethod
    def partially_update_repair_job(repair_job_id, data):
        """
        Partially updates an existing repair job.
        """
        try:
            repair_job = RepairJob.objects.filter(id=repair_job_id).first()
            if not repair_job:
                raise ValueError(f"Repair job with ID {repair_job_id} does not exist.")
            for key, value in data.items():
                setattr(repair_job, key, value)
            repair_job.save()
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error partially updating repair job: {str(e)}")
        return repair_job
    
    @staticmethod
    def get_repair_jobs_by_appointment(appointment_id):
        """
        Retrieves all repair jobs associated with a specific appointment.
        """
        try:
            repair_jobs = RepairJob.objects.filter(appointment_id=appointment_id)
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error retrieving repair jobs for appointment {appointment_id}: {str(e)}")
        return repair_jobs
    
    @staticmethod
    def get_repair_jobs_by_mechanic(mechanic_id):
        """
        Retrieves all repair jobs assigned to a specific mechanic.
        """
        try:
            repair_jobs = RepairJob.objects.filter(mechanic_id=mechanic_id)
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error retrieving repair jobs for mechanic {mechanic_id}: {str(e)}")
        return repair_jobs
