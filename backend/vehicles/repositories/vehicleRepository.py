from backend.repositories.baseRepository import BaseRepository
from ..models import Vehicle
from datetime import date

class VehicleRepository(BaseRepository):
    model = Vehicle

    @classmethod
    def get_vehicles_by_client(cls, client_id):
        """
        Pobiera wszystkie pojazdy powiązane z klientem.
        """
        return cls.model.objects.filter(owner_id=client_id)

    @classmethod
    def get_vehicles_due_for_maintenance(cls):
        """
        Pobiera pojazdy wymagające przeglądu technicznego.
        """
        return cls.model.objects.filter(last_maintenance_date__lt=date.today())

    @classmethod
    def get_vehicles_by_brand(cls, brand):
        """
        Pobiera wszystkie pojazdy określonej marki.
        """
        return cls.model.objects.filter(brand=brand)

    @staticmethod
    def get_vehicles_by_workshop(workshop_id):
        """
        Pobiera wszystkie pojazdy przypisane do określonego warsztatu.
        """
        from ..models import Vehicle
        return Vehicle.objects.filter(workshop_id=workshop_id)