from django.http import Http404
from django.core.exceptions import ValidationError
from ..repositories.appointmentsRepository import AppointmentRepository

class AppointmentService:
    @staticmethod
    def get_all_appointments():
        """
        Retrieves all appointments from the database.
        """
        try:
            return AppointmentRepository.get_all_appointments()
        except Exception as e:
            raise RuntimeError(f"Error retrieving appointments: {str(e)}")

    @staticmethod
    def create_appointment(data):
        """
        Creates a new appointment in the database.
        """
        try:
            # Example validation logic
            if data.get('date') > data.get('estimated_completion_date'):
                raise ValidationError("Completion date cannot be earlier than the appointment date")
            return AppointmentRepository.create_appointment(data)
        except ValidationError as e:
            raise ValidationError({"error": str(e)})
        except Exception as e:
            raise RuntimeError(f"Error creating appointment: {str(e)}")

    @staticmethod
    def get_appointment_by_id(appointment_id):
        """
        Retrieves an appointment by its ID.
        """
        try:
            appointment = AppointmentRepository.get_appointment_by_id(appointment_id)
            if not appointment:
                raise Http404("Appointment not found")
            return appointment
        except Http404 as e:
            raise Http404(str(e))
        except Exception as e:
            raise RuntimeError(f"Error retrieving appointment: {str(e)}")

    @staticmethod
    def delete_appointment(appointment_id):
        """
        Deletes an appointment by its ID.
        """
        try:
            appointment = AppointmentRepository.get_appointment_by_id(appointment_id)
            if not appointment:
                raise Http404("Appointment not found")
            return AppointmentRepository.delete_appointment(appointment_id)
        except Http404 as e:
            raise Http404(str(e))
        except Exception as e:
            raise RuntimeError(f"Error deleting appointment: {str(e)}")

    @staticmethod
    def update_appointment(appointment_id, data):
        """
        Updates an existing appointment.
        """
        try:
            appointment = AppointmentRepository.update_appointment(appointment_id, **data)
            return appointment
        except ValueError as e:
            raise Http404(str(e))
        except Exception as e:
            raise RuntimeError(f"Error updating appointment: {str(e)}")

    @staticmethod
    def partially_update_appointment(appointment_id, data):
        """
        Partially updates an existing appointment.
        """
        try:
            appointment = AppointmentRepository.partially_update_appointment(appointment_id, **data)
            return appointment
        except ValueError as e:
            raise Http404(str(e))
        except Exception as e:
            raise RuntimeError(f"Error partially updating appointment: {str(e)}")

    @staticmethod
    def get_appointments_by_client(client_id):
        """
        Retrieves all appointments for a specific client.
        """
        try:
            return AppointmentRepository.get_appointments_by_client(client_id)
        except ValueError as e:
            raise Http404(str(e))
        except Exception as e:
            raise RuntimeError(f"Error retrieving appointments for client: {str(e)}")

    @staticmethod
    def get_appointments_by_workshop(workshop_id):
        """
        Retrieves all appointments for a specific workshop.
        """
        try:
            return AppointmentRepository.get_appointments_by_workshop(workshop_id)
        except ValueError as e:
            raise Http404(str(e))
        except Exception as e:
            raise RuntimeError(f"Error retrieving appointments for workshop: {str(e)}")

    @staticmethod
    def get_appointments_by_vehicle(vehicle_id):
        """
        Retrieves all appointments for a specific vehicle.
        """
        try:
            return AppointmentRepository.get_appointments_by_vehicle(vehicle_id)
        except ValueError as e:
            raise Http404(str(e))
        except Exception as e:
            raise RuntimeError(f"Error retrieving appointments for vehicle: {str(e)}")

    @staticmethod
    def get_appointments_by_status(status):
        """
        Retrieves all appointments with a specific status.
        """
        try:
            return AppointmentRepository.get_appointments_by_status(status)
        except ValueError as e:
            raise Http404(str(e))
        except Exception as e:
            raise RuntimeError(f"Error retrieving appointments with status: {str(e)}")

    @staticmethod
    def get_appointments_by_priority(priority):
        """
        Retrieves all appointments with a specific priority.
        """
        try:
            return AppointmentRepository.get_appointments_by_priority(priority)
        except ValueError as e:
            raise Http404(str(e))
        except Exception as e:
            raise RuntimeError(f"Error retrieving appointments with priority: {str(e)}")