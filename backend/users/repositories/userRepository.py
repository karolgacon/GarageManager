from backend.repositories.baseRepository import BaseRepository
from ..models import User

class UserRepository(BaseRepository):
    model = User

    @classmethod
    def get_users_by_status(cls, status):
        """
        Pobiera użytkowników według statusu (np. 'active', 'blocked').
        """
        return cls.model.objects.filter(status=status)

    @classmethod
    def get_users_by_role(cls, role):
        """
        Pobiera użytkowników według roli (np. 'admin', 'mechanic', 'client').
        """
        return cls.model.objects.filter(role=role)

    @classmethod
    def search_users(cls, query):
        """
        Wyszukuje użytkowników na podstawie nazwy użytkownika lub emaila.
        """
        return cls.model.objects.filter(username__icontains=query) | cls.model.objects.filter(email__icontains=query)

    @classmethod
    def get_by_email(cls, email):
        """
        Pobiera użytkownika na podstawie adresu email.
        """
        return cls.model.objects.filter(email=email).first()

    @classmethod
    def create_user(cls, username, password, email):
        """
        Tworzy nowego użytkownika.
        """
        return cls.model.objects.create_user(username=username, password=password, email=email)

    @classmethod
    def get_clients(cls):
        """
        Pobiera wszystkich użytkowników z rolą 'client'.
        """
        return cls.model.objects.filter(role='client')

    @classmethod
    def get_mechanics(cls):
        """
        Pobiera wszystkich użytkowników z rolą 'mechanic'.
        """
        return cls.model.objects.filter(role='mechanic')