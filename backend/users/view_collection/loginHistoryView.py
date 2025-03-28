from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAdminUser
from ..models import LoginHistory
from ..serializers import LoginHistorySerializer

class LoginHistoryViewAPI(ModelViewSet):
    serializer_class = LoginHistorySerializer
    permission_classes = [IsAdminUser]  # Tylko administratorzy mogą przeglądać historię logowań
    queryset = LoginHistory.objects.all()

    def get_queryset(self):
        """Zwraca historię logowań użytkowników (dla admina)."""
        return self.queryset.order_by('-login_time')