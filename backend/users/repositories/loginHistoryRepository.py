from backend.repositories.baseRepository import BaseRepository
from ..models import LoginHistory

class LoginHistoryRepository(BaseRepository):
    model = LoginHistory

    @classmethod
    def get_all_ordered(cls):
        """
        Pobiera wszystkie wpisy historii logowań, posortowane od najnowszych.
        """
        return cls.model.objects.all().order_by('-login_time')