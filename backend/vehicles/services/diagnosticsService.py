from ..repositories.diagnosticsRepository import DiagnosticsRepository

class DiagnosticsService:
    @staticmethod
    def get_all_diagnostics():
        return DiagnosticsRepository.get_all_diagnostics()

    @staticmethod
    def get_diagnostic_by_id(diagnostic_id):
        return DiagnosticsRepository.get_diagnostic_by_id(diagnostic_id)

    @staticmethod
    def add_diagnostic(**data):
        return DiagnosticsRepository.create_diagnostic(data)

    @staticmethod
    def update_diagnostic(diagnostic_id, **data):
        diagnostic = DiagnosticsRepository.get_diagnostic_by_id(diagnostic_id)
        if not diagnostic:
            return None
        for key, value in data.items():
            setattr(diagnostic, key, value)
        diagnostic.save()
        return diagnostic

    @staticmethod
    def get_critical_diagnostics():
        return DiagnosticsRepository.get_critical_diagnostics()

    @staticmethod
    def delete_diagnostic(diagnostic_id):
        return DiagnosticsRepository.delete_diagnostic(diagnostic_id)