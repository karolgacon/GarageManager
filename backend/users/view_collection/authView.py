from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from ..services.authService import AuthService
from django.core.exceptions import ValidationError


class CreateUserView(APIView):
    """
    Widok do rejestracji nowego użytkownika.
    """
    permission_classes = (AllowAny,)

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