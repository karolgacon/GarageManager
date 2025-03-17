from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

class RefreshTokenView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh_token")
            if not refresh_token:
                return Response(
                    {"error": "Refresh token not provided"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Tworzenie nowego access tokena na podstawie refresh tokena
            refresh = RefreshToken(refresh_token)
            new_access_token = str(refresh.access_token)

        except Exception as e:
            return Response(
                {"error": "Invalid or expired refresh token"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        return Response({"access": new_access_token}, status=status.HTTP_200_OK)
