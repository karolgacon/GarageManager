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
            "year": vehicle.year,  # Zmienione z manufacture_year na year
            "vin": vehicle.vin,
            "registration_number": vehicle.registration_number,
            "last_service_date": vehicle.last_service_date,  # Zmienione z last_maintenance_date
            "owner": vehicle.owner.username if vehicle.owner else None,  # Zmienione z client na owner
        }

    @classmethod
    def get_vehicles_by_client(cls, client_id):
        """
        Pobiera wszystkie pojazdy powiązane z klientem.
        """
        return cls.repository.get_vehicles_by_owner(client_id)  # Zmienione na owner

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
        vehicles = cls.repository.get_vehicles_by_owner(client_id)  # Zmienione na owner
        if vehicles:
            return vehicles.first().workshop if hasattr(vehicles.first(), 'workshop') else None
        return None