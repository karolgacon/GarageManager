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
    def get_vehicles_by_owner(cls, owner_id):
        """
        Pobiera wszystkie pojazdy powiązane z właścicielem.
        This is an alias for get_vehicles_by_client to maintain compatibility.
        """
        return cls.get_vehicles_by_client(owner_id)

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
        Pobiera wszystkie pojazdy które miały wizyty w określonym warsztacie.
        """
        from ..models import Vehicle
        
        # Pobierz pojazdy przez appointments w warsztacie
        return Vehicle.objects.filter(
            appointments__workshop_id=workshop_id
        ).distinct()

    @classmethod
    def get_vehicles_in_service_by_owner(cls, owner_id):
        """
        Pobiera pojazdy należące do właściciela, które są aktualnie w serwisie.
        Pojazd jest w serwisie jeśli ma aktywny appointment ze statusem 'confirmed' lub 'in_progress'.
        """
        from appointments.models import Appointment
        
        return cls.model.objects.filter(
            owner_id=owner_id,
            appointments__status__in=['confirmed', 'in_progress']
        ).select_related(
            'owner'
        ).prefetch_related(
            'appointments__workshop',
            'appointments__assigned_mechanic'
        ).distinct()