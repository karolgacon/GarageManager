from backend.repositories.baseRepository import BaseRepository
from ..models import VehicleService

class VehicleServiceRepository(BaseRepository):
    """
    Repository for VehicleService model operations.
    Handles data access layer operations for vehicle services.
    """
    model = VehicleService

    @classmethod
    def get_by_filter(cls, **kwargs):
        """
        Get vehicle services by filter criteria.
        """
        try:
            return cls.model.objects.filter(**kwargs)
        except Exception as e:
            raise RuntimeError(f"Error retrieving {cls.model.__name__} by filter: {str(e)}")
    
    @classmethod
    def get_by_vehicle(cls, vehicle_id):
        """
        Get all services for a specific vehicle.
        """
        try:
            return cls.model.objects.filter(vehicle_id=vehicle_id)
        except Exception as e:
            raise RuntimeError(f"Error retrieving services for vehicle {vehicle_id}: {str(e)}")
    
    @classmethod
    def get_by_client(cls, client_id):
        """
        Get all services for a client's vehicles.
        """
        try:
            return cls.model.objects.filter(vehicle__owner_id=client_id)
        except Exception as e:
            raise RuntimeError(f"Error retrieving services for client {client_id}: {str(e)}")