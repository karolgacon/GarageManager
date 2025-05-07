from backend.services.baseService import BaseService
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from ..repositories.userRepository import UserRepository

class AuthService(BaseService):
    repository = UserRepository

    @classmethod
    def register_user(cls, username, password, email):
        """
        Rejestruje nowego użytkownika.
        """
        if cls.repository.get_by_email(email):
            raise ValueError("User with this email already exists.")
        user = cls.repository.create_user(username=username, password=password, email=email)
        refresh = RefreshToken.for_user(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_active": user.is_active,
            }
        }

    @classmethod
    def login_user(cls, email, password):
        """
        Loguje użytkownika na podstawie emaila i hasła.
        """
        user = cls.repository.get_by_email(email)
        if not user:
            raise ValueError("Invalid email or password.")
        user = authenticate(username=user.email, password=password)
        if not user:
            raise ValueError("Invalid email or password.")
        refresh = RefreshToken.for_user(user)
        return {
            "token": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_active": user.is_active,
                "role": user.role,
            },
        }