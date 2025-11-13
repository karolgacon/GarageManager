from django.http import Http404
from django.core.exceptions import ValidationError
from ..repositories.appointmentsRepository import AppointmentRepository
from backend.services.baseService import BaseService

class AppointmentService(BaseService):
    repository = AppointmentRepository

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
    def get_appointments_by_mechanic(mechanic_id):
        """
        Retrieves all appointments assigned to a specific mechanic.
        """
        try:
            return AppointmentRepository.get_appointments_by_mechanic(mechanic_id)
        except ValueError as e:
            raise Http404(str(e))
        except Exception as e:
            raise RuntimeError(f"Error retrieving appointments for mechanic: {str(e)}")

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
        except Exception as e:
            raise RuntimeError(f"Error retrieving appointments with status: {str(e)}")

    @staticmethod
    def get_appointments_by_priority(priority):
        """
        Retrieves all appointments with a specific priority.
        """
        try:
            return AppointmentRepository.get_appointments_by_priority(priority)
        except Exception as e:
            raise RuntimeError(f"Error retrieving appointments with priority: {str(e)}")