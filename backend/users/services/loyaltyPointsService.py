from backend.services.baseService import BaseService
from ..repositories.loyaltyPointsRepository import LoyaltyPointsRepository
from django.core.exceptions import ValidationError

class LoyaltyPointsService(BaseService):
    repository = LoyaltyPointsRepository

    @classmethod
    def get_loyalty_status(cls, user):
        """
        Pobiera status lojalnościowy użytkownika.
        """
        loyalty = cls.repository.get_by_user(user)
        if not loyalty:
            raise ValidationError("Loyalty points not found for this user.")
        return loyalty