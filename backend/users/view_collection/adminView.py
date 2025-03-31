from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from ..serializers import UserSerializer  # Zakładam, że masz już serializator

User = get_user_model()


class AdminViewSet(viewsets.ModelViewSet):
    """
    Widok dla administratora - umożliwia zarządzanie wszystkimi użytkownikami
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        """
        Zapewnia, że tylko admin ma dostęp do tych endpointów
        """
        permission_classes = [permissions.IsAuthenticated]
        if self.action in ['list', 'retrieve', 'create', 'update', 'destroy']:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """
        Panel główny admina z podsumowaniem danych
        """
        total_users = User.objects.count()
        active_users = User.objects.filter(status='active').count()
        blocked_users = User.objects.filter(status='blocked').count()

        return Response({
            'total_users': total_users,
            'active_users': active_users,
            'blocked_users': blocked_users,
            # Inne statystyki, które chcesz wyświetlić
        })

    @action(detail=True, methods=['post'])
    def block_user(self, request, pk=None):
        """
        Blokowanie użytkownika
        """
        user = self.get_object()
        user.status = 'blocked'
        user.save()
        return Response({'status': 'user blocked'})

    @action(detail=True, methods=['post'])
    def activate_user(self, request, pk=None):
        """
        Aktywacja użytkownika
        """
        user = self.get_object()
        user.status = 'active'
        user.save()
        return Response({'status': 'user activated'})