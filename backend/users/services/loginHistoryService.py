from backend.services.baseService import BaseService
from ..repositories.loginHistoryRepository import LoginHistoryRepository

class LoginHistoryService(BaseService):
    repository = LoginHistoryRepository

    @classmethod
    def get_all_ordered(cls):
        """
        Pobiera wszystkie wpisy historii logowań, posortowane od najnowszych.
        """
        return cls.repository.get_all_ordered()