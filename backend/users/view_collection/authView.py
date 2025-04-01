from rest_framework_simplejwt.views import TokenObtainPairView
from ..models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from ..serializers import UserSerializer, CustomTokenObtainPairSerializer
from django.contrib.auth import authenticate


class CreateUserView(APIView):
    permission_classes = (AllowAny,)
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        email = request.data.get('email')

        if User.objects.filter(username=username).exists():
            return Response({"error": "User already exists"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, password=password, email=email)
        refresh = RefreshToken.for_user(user)

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token)
        }, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    permission_classes = (AllowAny,)
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Nieprawidłowy email lub hasło"}, status=status.HTTP_400_BAD_REQUEST)

        # Logowanie po emailu
        user = authenticate(request, username=user.email, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                "token": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "is_active": user.is_active,
                    "role": user.role
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Nieprawidłowy email lub hasło"}, status=status.HTTP_400_BAD_REQUEST)
