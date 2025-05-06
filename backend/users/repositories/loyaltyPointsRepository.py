from backend.repositories.baseRepository import BaseRepository
from ..models import LoyaltyPoints

class LoyaltyPointsRepository(BaseRepository):
    model = LoyaltyPoints

    @classmethod
    def get_by_user(cls, user):
        """
        Pobiera punkty lojalnościowe powiązane z użytkownikiem.
        """
        return cls.model.objects.filter(user=user).first()