from backend.services.baseService import BaseService
from ..repositories.vehicleRepository import VehicleRepository

class VehicleService(BaseService):
    repository = VehicleRepository

    @classmethod
    def get_vehicle_details(cls, vehicle_id):
        """
        Pobiera szczegóły pojazdu na podstawie ID.
        """
        vehicle = cls.repository.get_by_id(vehicle_id)
        if not vehicle:
            return None
        return {
            "id": vehicle.id,
            "make": vehicle.brand,
            "model": vehicle.model,
            "year": vehicle.year,
            "vin": vehicle.vin,
            "registration_number": vehicle.registration_number,
            "last_service_date": vehicle.last_service_date,
            "owner": vehicle.owner.username if vehicle.owner else None,
        }

    @classmethod
    def get_vehicles_by_client(cls, client_id):
        """
        Pobiera wszystkie pojazdy powiązane z klientem.
        """
        return cls.repository.get_vehicles_by_owner(client_id)

    @classmethod
    def get_vehicles_due_for_maintenance(cls):
        """
        Pobiera pojazdy wymagające przeglądu technicznego.
        """
        return cls.repository.get_vehicles_due_for_maintenance()

    @classmethod
    def get_vehicles_by_brand(cls, brand):
        """
        Pobiera wszystkie pojazdy określonej marki.
        """
        return cls.repository.get_vehicles_by_brand(brand)

    @classmethod
    def get_vehicles_by_workshop(cls, workshop_id):
        """
        Pobiera wszystkie pojazdy przypisane do określonego warsztatu.
        """
        return cls.repository.get_vehicles_by_workshop(workshop_id)

    @classmethod
    def get_workshop_by_client(cls, client_id):
        """
        Pobiera warsztat na podstawie klienta (przez jego pojazdy).
        """
        vehicles = cls.repository.get_vehicles_by_owner(client_id)
        if vehicles:
            return vehicles.first().workshop if hasattr(vehicles.first(), 'workshop') else None
        return None

    @classmethod
    def get_vehicles_in_service_by_owner(cls, owner_id):
        """
        Pobiera pojazdy należące do właściciela, które są aktualnie w serwisie.
        Zwraca pojazdy z dodatkowymi informacjami o aktualnym warsztacie i mechaniku.
        """
        vehicles = cls.repository.get_vehicles_in_service_by_owner(owner_id)
        
        # Dodaj informacje o aktualnym appointment dla każdego pojazdu
        result = []
        for vehicle in vehicles:
            # Pobierz aktualny appointment (najnowszy aktywny)
            current_appointment = vehicle.appointments.filter(
                status__in=['confirmed', 'in_progress']
            ).order_by('-date').first()
            
            if current_appointment:
                # Dodaj dodatkowe atrybuty do pojazdu
                vehicle.current_appointment = current_appointment
                vehicle.current_workshop_id = current_appointment.workshop.id
                vehicle.current_workshop_name = current_appointment.workshop.name
                vehicle.current_mechanic_id = current_appointment.assigned_mechanic.id if current_appointment.assigned_mechanic else None
                vehicle.current_mechanic_name = f"{current_appointment.assigned_mechanic.first_name} {current_appointment.assigned_mechanic.last_name}" if current_appointment.assigned_mechanic else "Nie przypisano"
                result.append(vehicle)
        
        return result