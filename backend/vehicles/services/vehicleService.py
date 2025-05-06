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
            "year": vehicle.manufacture_year,
            "vin": vehicle.vin,
            "registration_number": vehicle.registration_number,
            "last_maintenance_date": vehicle.last_maintenance_date,
            "owner": vehicle.client.username if vehicle.client else None,
        }

    @classmethod
    def get_vehicles_by_client(cls, client_id):
        """
        Pobiera wszystkie pojazdy powiązane z klientem.
        """
        return cls.repository.get_vehicles_by_client(client_id)

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