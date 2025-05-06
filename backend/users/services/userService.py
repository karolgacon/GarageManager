from backend.services.baseService import BaseService
from ..repositories.userRepository import UserRepository

class UserService(BaseService):
    repository = UserRepository

    @classmethod
    def activate_user(cls, user_id):
        """
        Aktywuje użytkownika.
        """
        user = cls.repository.get_by_id(user_id)
        if user.status == 'active':
            raise ValueError("User is already active.")
        cls.repository.update(user_id, {"status": "active"})
        return {"status": "User activated"}

    @classmethod
    def block_user(cls, user_id):
        """
        Blokuje użytkownika.
        """
        user = cls.repository.get_by_id(user_id)
        if user.status == 'blocked':
            raise ValueError("User is already blocked.")
        cls.repository.update(user_id, {"status": "blocked"})
        return {"status": "User blocked"}

    @classmethod
    def get_dashboard_statistics(cls):
        """
        Generuje statystyki dla panelu administratora.
        """
        total_users = cls.repository.get_all().count()
        active_users = cls.repository.get_users_by_status('active').count()
        blocked_users = cls.repository.get_users_by_status('blocked').count()
        return {
            "total_users": total_users,
            "active_users": active_users,
            "blocked_users": blocked_users
        }

    @classmethod
    def search_users(cls, query):
        """
        Wyszukuje użytkowników na podstawie zapytania.
        """
        users = cls.repository.search_users(query)
        return [{"id": user.id, "username": user.username, "email": user.email} for user in users]