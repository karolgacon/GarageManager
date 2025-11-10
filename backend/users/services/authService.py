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
        
        # Get workshop_id for owner
        workshop_id = None
        if user.role == 'owner':
            from workshops.models import Workshop
            workshop = Workshop.objects.filter(owner=user).first()
            if workshop:
                workshop_id = workshop.id
        
        refresh = RefreshToken.for_user(user)
        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_active": user.is_active,
            "role": user.role,
        }
        
        if workshop_id:
            user_data["workshop_id"] = workshop_id
            
        return {
            "token": str(refresh.access_token),
            "refresh": str(refresh),
            "user": user_data,
        }