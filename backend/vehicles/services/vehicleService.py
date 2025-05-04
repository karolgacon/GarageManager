from ..repositories.vehicleRepository import VehicleRepository

class VehicleService:
    @staticmethod
    def get_vehicle_details(vehicle_id):
        vehicle = VehicleRepository.get_vehicle_by_id(vehicle_id)
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

    @staticmethod
    def create_vehicle(data):
        """
        Creates a new vehicle using the provided data.
        """
        vehicle = VehicleRepository.create_vehicle(data)
        return VehicleService.get_vehicle_details(vehicle.id)
    
    @staticmethod
    def update_vehicle_details(vehicle_id, **kwargs):
        vehicle = VehicleRepository.get_vehicle_by_id(vehicle_id)
        if not vehicle:
            return None
        for key, value in kwargs.items():
            if hasattr(vehicle, key):
                setattr(vehicle, key, value)
        vehicle.save()
        return VehicleService.get_vehicle_details(vehicle_id)

    @staticmethod
    def get_vehicles_by_client(client_id):
        return VehicleRepository.get_vehicles_by_client(client_id)

    @staticmethod
    def get_vehicles_due_for_maintenance():
        return VehicleRepository.get_vehicles_due_for_maintenance()

    @staticmethod
    def delete_vehicle(vehicle_id):
        return VehicleRepository.delete_vehicle(vehicle_id)