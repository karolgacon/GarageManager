from ..models import Appointment

class AppointmentRepository:
    @staticmethod
    def get_all_appointments():
        """
        Retrieves all appointments from the database.
        """
        try:
            appointments = Appointment.objects.all()
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error retrieving appointments: {str(e)}")
        return appointments
    
    @staticmethod
    def create_appointment(data):
        """
        Creates a new appointment in the database.
        """
        try:
            # Validate data here if needed
            appointment = Appointment(**data)
            appointment.save()
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error creating appointment: {str(e)}")
        # Return the created appointment object
        return appointment

    @staticmethod
    def get_appointment_by_id(appointment_id):
        """
        Retrieves an appointment by its ID.
        """
        try:
            appointment = Appointment.objects.filter(id=appointment_id).first()
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error retrieving appointment: {str(e)}")
        if not appointment:
            raise ValueError(f"Appointment with ID {appointment_id} does not exist.")
        return appointment

    @staticmethod
    def delete_appointment(appointment_id):
        """
        Deletes an appointment by its ID.
        """
        try:
            appointment = Appointment.objects.filter(id=appointment_id).first()
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error deleting appointment: {str(e)}")
        if not appointment:
            raise ValueError(f"Appointment with ID {appointment_id} does not exist.")
        appointment.delete()
        return True
    
    @staticmethod
    def update_appointment(appointment_id, **data):
        """
        Updates an existing appointment.
        """
        try:
            appointment = Appointment.objects.filter(id=appointment_id).first()
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error updating appointment: {str(e)}")
        if not appointment:
            raise ValueError(f"Appointment with ID {appointment_id} does not exist.")
        for key, value in data.items():
            setattr(appointment, key, value)
        appointment.save()
        return appointment
    
    @staticmethod
    def partially_update_appointment(appointment_id, **data):
        """
        Partially updates an existing appointment.
        """
        try:
            appointment = Appointment.objects.filter(id=appointment_id).first()
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error partially updating appointment: {str(e)}")
        if not appointment:
            raise ValueError(f"Appointment with ID {appointment_id} does not exist.")
        for key, value in data.items():
            setattr(appointment, key, value)
        appointment.save()
        return appointment
    
    @staticmethod
    def get_appointments_by_client(client_id):
        """
        Retrieves all appointments for a specific client.
        """
        try:
            appointments = Appointment.objects.filter(client_id=client_id)
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error retrieving appointments for client {client_id}: {str(e)}")
        if not appointments:
            raise ValueError(f"No appointments found for client with ID {client_id}.")
        return appointments
    
    @staticmethod
    def get_appointments_by_workshop(workshop_id):
        """
        Retrieves all appointments for a specific workshop.
        """
        try:
            appointments = Appointment.objects.filter(workshop_id=workshop_id)
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error retrieving appointments for workshop {workshop_id}: {str(e)}")
        if not appointments:
            raise ValueError(f"No appointments found for workshop with ID {workshop_id}.")  
        return appointments
    @staticmethod
    def get_appointments_by_vehicle(vehicle_id):
        """
        Retrieves all appointments for a specific vehicle.
        """
        try:
            appointments = Appointment.objects.filter(vehicle_id=vehicle_id)
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error retrieving appointments for vehicle {vehicle_id}: {str(e)}")
        if not appointments:
            raise ValueError(f"No appointments found for vehicle with ID {vehicle_id}.")
        return appointments
    
    @staticmethod
    def get_appointments_by_status(status):
        """
        Retrieves all appointments with a specific status.
        """
        try:
            appointments = Appointment.objects.filter(status=status)
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error retrieving appointments with status {status}: {str(e)}")
        if not appointments:
            raise ValueError(f"No appointments found with status {status}.")
        return appointments
    
    @staticmethod
    def get_appointments_by_priority(priority):
        """
        Retrieves all appointments with a specific priority.
        """
        try:
            appointments = Appointment.objects.filter(priority=priority)
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error retrieving appointments with priority {priority}: {str(e)}")
        if not appointments:
            raise ValueError(f"No appointments found with priority {priority}.")
        return appointments