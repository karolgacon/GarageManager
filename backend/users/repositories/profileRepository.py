from backend.repositories.baseRepository import BaseRepository
from ..models import Profile

class ProfileRepository(BaseRepository):
    model = Profile

    @classmethod
    def get_by_user(cls, user):
        """
        Pobiera profil powiązany z użytkownikiem.
        """
        return cls.model.objects.filter(user=user).first()