from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema
from ..services.authService import AuthService
from django.core.exceptions import ValidationError
from ..serializers import CustomTokenObtainPairSerializer

from ..services.userService import UserService

class PublicUserDetailView(APIView):
    """
    Publiczny widok do pobierania szczegółów użytkownika na podstawie ID.
    """
    permission_classes = (AllowAny,)

    @extend_schema(
        summary="Get public user details",
        description="Retrieve public details of a user by their ID.",
        parameters=[
            {
                "name": "id",
                "in": "path",
                "required": True,
                "description": "ID of the user",
                "schema": {"type": "integer"},
            }
        ],
        responses={
            200: {
                "description": "User details retrieved successfully.",
                "content": {
                    "application/json": {
                        "example": {
                            "id": 1,
                            "username": "john_doe",
                            "email": "john.doe@example.com",
                            "role": "client",
                            "is_active": True,
                        }
                    }
                },
            },
            404: {"description": "User not found."},
        },
    )
    def get(self, request, id):
        """
        Pobiera szczegóły użytkownika na podstawie ID.
        """
        try:
            user = UserService.get_by_id(id)
            if not user:
                return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
            return Response(
                {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role,
                    "is_active": user.is_active,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CreateUserView(APIView):
    """
    Widok do rejestracji nowego użytkownika.
    """
    permission_classes = (AllowAny,)

    @extend_schema(
        summary="Register a new user",
        description="Registers a new user with a username, email, and password.",
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "username": {"type": "string", "example": "john_doe"},
                    "email": {"type": "string", "example": "john.doe@example.com"},
                    "password": {"type": "string", "example": "securepassword123"},
                },
                "required": ["username", "email", "password"],
            }
        },
        responses={
            201: {"description": "User successfully registered."},
            400: {"description": "Validation error."},
        },
    )
    def post(self, request):
        """
        Rejestruje nowego użytkownika.
        """
        username = request.data.get("username")
        password = request.data.get("password")
        email = request.data.get("email")

        try:
            result = AuthService.register_user(username=username, password=password, email=email)
            return Response(result, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    Widok do logowania użytkownika.
    """
    permission_classes = (AllowAny,)
    serializer_class = CustomTokenObtainPairSerializer

    @extend_schema(
        summary="Log in a user",
        description="Logs in a user with an email and password, returning a JWT token and user details.",
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "email": {"type": "string", "example": "john.doe@example.com"},
                    "password": {"type": "string", "example": "securepassword123"},
                },
                "required": ["email", "password"],
            }
        },
        responses={
            200: {
                "description": "User successfully logged in.",
                "content": {
                    "application/json": {
                        "example": {
                            "token": "jwt_access_token",
                            "refresh": "jwt_refresh_token",
                            "user": {
                                "id": 1,
                                "username": "john_doe",
                                "email": "john.doe@example.com",
                                "role": "client",
                                "is_active": True,
                            },
                        }
                    }
                },
            },
            400: {"description": "Validation error."},
        },
    )
    def post(self, request):
        """
        Loguje użytkownika na podstawie emaila i hasła.
        """
        email = request.data.get("email")
        password = request.data.get("password")

        try:
            result = AuthService.login_user(email=email, password=password)
            return Response(result, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)