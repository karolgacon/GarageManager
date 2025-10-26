from ..models import Appointment
from backend.repositories.baseRepository import BaseRepository

class AppointmentRepository(BaseRepository):
    model = Appointment

    @staticmethod
    def get_appointments_by_client(client_id):
        """
        Retrieves all appointments for a specific client.
        """
        try:
            appointments = Appointment.objects.filter(client_id=client_id)
            if not appointments.exists():
                raise ValueError(f"No appointments found for client with ID {client_id}.")
            return appointments
        except Exception as e:
            raise RuntimeError(f"Error retrieving appointments for client {client_id}: {str(e)}")

    @staticmethod
    def get_appointments_by_mechanic(mechanic_id):
        """
        Retrieves all appointments assigned to a specific mechanic.
        """
        try:
            appointments = Appointment.objects.filter(assigned_mechanic_id=mechanic_id)
            if not appointments.exists():
                raise ValueError(f"No appointments found for mechanic with ID {mechanic_id}.")
            return appointments
        except Exception as e:
            raise RuntimeError(f"Error retrieving appointments for mechanic {mechanic_id}: {str(e)}")

    @staticmethod
    def get_appointments_by_workshop(workshop_id):
        """
        Retrieves all appointments for a specific workshop.
        """
        try:
            appointments = Appointment.objects.filter(workshop_id=workshop_id)
            if not appointments.exists():
                raise ValueError(f"No appointments found for workshop with ID {workshop_id}.")
            return appointments
        except Exception as e:
            raise RuntimeError(f"Error retrieving appointments for workshop {workshop_id}: {str(e)}")

    @staticmethod
    def get_appointments_by_vehicle(vehicle_id):
        """
        Retrieves all appointments for a specific vehicle.
        """
        try:
            appointments = Appointment.objects.filter(vehicle_id=vehicle_id)
            if not appointments.exists():
                raise ValueError(f"No appointments found for vehicle with ID {vehicle_id}.")
            return appointments
        except Exception as e:
            raise RuntimeError(f"Error retrieving appointments for vehicle {vehicle_id}: {str(e)}")

    @staticmethod
    def get_appointments_by_status(status):
        """
        Retrieves all appointments with a specific status.
        """
        try:
            appointments = Appointment.objects.filter(status=status)
            if not appointments.exists():
                raise ValueError(f"No appointments found with status {status}.")
            return appointments
        except Exception as e:
            raise RuntimeError(f"Error retrieving appointments with status {status}: {str(e)}")

    @staticmethod
    def get_appointments_by_priority(priority):
        """
        Retrieves all appointments with a specific priority.
        """
        try:
            appointments = Appointment.objects.filter(priority=priority)
            if not appointments.exists():
                raise ValueError(f"No appointments found with priority {priority}.")
            return appointments
        except Exception as e:
            raise RuntimeError(f"Error retrieving appointments with priority {priority}: {str(e)}")