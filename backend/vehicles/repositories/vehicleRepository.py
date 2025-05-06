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
        return cls.model.objects.filter(client_id=client_id)

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