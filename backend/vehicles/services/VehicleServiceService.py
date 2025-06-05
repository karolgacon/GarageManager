from django.http import Http404
from django.forms import ValidationError

from ..repositories.VehicleServiceRepository import VehicleServiceRepository

class VehicleServiceService:
    """
    Service class for VehicleService operations.
    Implements business logic for vehicle services.
    """

    def __init__(self):
        self.repository = VehicleServiceRepository

    def get_all(self):
        """Get all vehicle services."""
        try:
            return self.repository.get_all()
        except Exception as e:
            raise Http404(str(e))

    def get_by_id(self, id):
        """Get vehicle service by ID."""
        try:
            return self.repository.get_by_id(id)
        except ValueError as e:
            raise Http404(str(e))
        except Exception as e:
            raise ValidationError(str(e))

    def get_by_filter(self, **kwargs):
        """Get vehicle services by filter."""
        try:
            return self.repository.get_by_filter(**kwargs)
        except Exception as e:
            raise ValidationError(str(e))

    def get_by_vehicle(self, vehicle_id):
        """Get services for a specific vehicle."""
        try:
            return self.repository.get_by_vehicle(vehicle_id)
        except Exception as e:
            raise ValidationError(str(e))

    def get_by_client(self, client_id):
        """Get services for a client's vehicles."""
        try:
            return self.repository.get_by_client(client_id)
        except Exception as e:
            raise ValidationError(str(e))

    def create(self, data):
        """Create new vehicle service."""
        try:
            return self.repository.create(data)
        except Exception as e:
            raise ValidationError(str(e))

    def update(self, id, data):
        """Update existing vehicle service."""
        try:
            return self.repository.update(id, data)
        except ValueError as e:
            raise Http404(str(e))
        except Exception as e:
            raise ValidationError(str(e))

    def partially_update(self, id, data):
        """Partially update vehicle service."""
        return self.update(id, data)

    def delete(self, id):
        """Delete vehicle service."""
        try:
            self.repository.delete(id)
        except ValueError as e:
            raise Http404(str(e))
        except Exception as e:
            raise ValidationError(str(e))