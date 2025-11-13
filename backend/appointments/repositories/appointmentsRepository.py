from ..models import Appointment
from backend.repositories.baseRepository import BaseRepository

class AppointmentRepository(BaseRepository):
    model = Appointment

    @staticmethod
    def get_appointments_by_client(client_id, start_date=None, end_date=None):
        """
        Retrieves all appointments for a specific client.
        Optionally filters by date range.
        """
        try:
            appointments = Appointment.objects.filter(client_id=client_id)
            
            # Apply date filters if provided
            if start_date:
                appointments = appointments.filter(date__date__gte=start_date)
            if end_date:
                appointments = appointments.filter(date__date__lte=end_date)
            
            # Return empty queryset instead of raising error when no appointments found
            return appointments
        except Exception as e:
            raise RuntimeError(f"Error retrieving appointments for client {client_id}: {str(e)}")

    @staticmethod
    def get_appointments_by_mechanic(mechanic_id, start_date=None, end_date=None):
        """
        Retrieves all appointments assigned to a specific mechanic.
        Optionally filters by date range.
        """
        try:
            appointments = Appointment.objects.filter(assigned_mechanic_id=mechanic_id)
            
            # Apply date filters if provided
            if start_date:
                appointments = appointments.filter(date__date__gte=start_date)
            if end_date:
                appointments = appointments.filter(date__date__lte=end_date)
            
            # Return empty queryset instead of raising error when no appointments found
            return appointments
        except Exception as e:
            raise RuntimeError(f"Error retrieving appointments for mechanic {mechanic_id}: {str(e)}")

    @staticmethod
    def get_appointments_by_workshop(workshop_id, start_date=None, end_date=None):
        """
        Retrieves all appointments for a specific workshop.
        Optionally filters by date range.
        """
        try:
            appointments = Appointment.objects.filter(workshop_id=workshop_id)
            
            # Apply date filters if provided
            if start_date:
                appointments = appointments.filter(date__date__gte=start_date)
            if end_date:
                appointments = appointments.filter(date__date__lte=end_date)
            
            # Return empty queryset instead of raising error when no appointments found
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
            # Return empty queryset instead of raising error when no appointments found
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
            # Return empty queryset instead of raising error when no appointments found
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
            # Return empty queryset instead of raising error when no appointments found
            return appointments
        except Exception as e:
            raise RuntimeError(f"Error retrieving appointments with priority {priority}: {str(e)}")