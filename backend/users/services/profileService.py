from backend.services.baseService import BaseService
from ..repositories.profileRepository import ProfileRepository
from ..models import User  # Import z users.models zamiast django.contrib.auth.models

class ProfileService(BaseService):
    repository = ProfileRepository

    @classmethod
    def get_profile_by_user(cls, user):
        """
        Pobiera profil powiązany z użytkownikiem.
        """
        profile = cls.repository.get_by_user(user)
        if not profile:
            raise ValueError("Profile not found.")
        return profile

    @classmethod
    def create_profile(cls, user, data):
        """
        Tworzy profil powiązany z użytkownikiem.
        """
        if cls.repository.get_by_user(user):
            raise ValueError("Profile already exists.")
        data['user'] = user
        return cls.repository.create(data)

    @classmethod
    def update_profile(cls, user, data):
        """
        Aktualizuje profil powiązany z użytkownikiem.
        """
        profile = cls.get_profile_by_user(user)
        return cls.repository.update(profile.id, data)

    @classmethod
    def delete_profile(cls, user):
        """
        Usuwa profil powiązany z użytkownikiem.
        """
        profile = cls.get_profile_by_user(user)
        cls.repository.delete(profile.id)
        return {"message": "Profile deleted successfully"}

    @classmethod
    def create(cls, data):
        # Jeśli user_id jest w data, zamień go na instancję User
        if 'user' in data and isinstance(data['user'], (int, str)):
            try:
                user_instance = User.objects.get(id=data['user'])
                data['user'] = user_instance
            except User.DoesNotExist:
                raise ValueError(f"User with id {data['user']} does not exist")
        
        return super().create(data)