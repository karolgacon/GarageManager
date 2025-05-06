from backend.services.baseService import BaseService
from ..repositories.userRepository import UserRepository

class MechanicService(BaseService):
    repository = UserRepository

    @classmethod
    def get_all_clients(cls):
        """
        Pobiera wszystkich klientów.
        """
        return cls.repository.get_clients()

    @classmethod
    def get_client_details(cls, client_id):
        """
        Pobiera szczegóły klienta na podstawie ID.
        """
        return cls.repository.get_by_id(client_id)