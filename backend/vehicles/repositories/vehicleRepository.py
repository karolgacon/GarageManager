from ..models import Vehicle

class VehicleRepository:
    @staticmethod
    def get_all_vehicles():
        return Vehicle.objects.all()
    
    @staticmethod
    def create_vehicle(data):
        """
        Creates a new vehicle in the database.
        """
        return Vehicle.objects.create(**data)

    @staticmethod
    def get_vehicle_by_id(vehicle_id):
        return Vehicle.objects.filter(id=vehicle_id).first()

    @staticmethod
    def get_vehicles_by_client(client_id):
        return Vehicle.objects.filter(client_id=client_id)

    @staticmethod
    def get_vehicles_due_for_maintenance():
        from datetime import date
        return Vehicle.objects.filter(last_maintenance_date__lt=date.today())

    @staticmethod
    def delete_vehicle(vehicle_id):
        vehicle = Vehicle.objects.filter(id=vehicle_id).first()
        if vehicle:
            vehicle.delete()
            return True
        return False