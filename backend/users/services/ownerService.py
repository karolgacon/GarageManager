from backend.services.baseService import BaseService
from ..repositories.userRepository import UserRepository

class OwnerService(BaseService):
    repository = UserRepository

    @classmethod
    def get_mechanics(cls):
        """
        Pobiera wszystkich mechaników.
        """
        return cls.repository.get_mechanics()

    @classmethod
    def get_clients(cls):
        """
        Pobiera wszystkich klientów.
        """
        return cls.repository.get_clients()

    @classmethod
    def add_mechanic(cls, user_id):
        """
        Ustawia rolę użytkownika na 'mechanic'.
        """
        user = cls.repository.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        user.role = 'mechanic'
        user.save()
        return user