from ..models import Diagnostics

class DiagnosticsRepository:
    @staticmethod
    def get_all_diagnostics():
        return Diagnostics.objects.all()
    
    @staticmethod
    def create_diagnostic(data):
        """
        Creates a new diagnostic in the database.
        """
        return Diagnostics.objects.create(**data)

    @staticmethod
    def get_diagnostics_by_vehicle(vehicle_id):
        return Diagnostics.objects.filter(vehicle_id=vehicle_id)

    @staticmethod
    def get_critical_diagnostics():
        return Diagnostics.objects.filter(severity_level='critical')

    @staticmethod
    def get_diagnostic_by_id(diagnostic_id):
        return Diagnostics.objects.filter(id=diagnostic_id).first()

    @staticmethod
    def delete_diagnostic(diagnostic_id):
        diagnostic = Diagnostics.objects.filter(id=diagnostic_id).first()
        if diagnostic:
            diagnostic.delete()
            return True
        return False