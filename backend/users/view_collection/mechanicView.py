from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from ..serializers import UserSerializer  # Zakładam, że masz już serializator

User = get_user_model()


class MechanicPermission(permissions.BasePermission):
    """
    Niestandardowe uprawnienia dla mechanika
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'mechanic'


class MechanicViewSet(viewsets.ModelViewSet):
    """
    Widok dla mechanika warsztatu
    """
    queryset = User.objects.filter(role='client')
    serializer_class = UserSerializer
    permission_classes = [MechanicPermission]

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """
        Panel główny mechanika
        """
        total_clients = User.objects.filter(role='client').count()

        return Response({
            'total_clients': total_clients,
            # Inne statystyki dla mechanika
        })

    @action(detail=False, methods=['get'])
    def clients(self, request):
        """
        Lista wszystkich klientów
        """
        clients = User.objects.filter(role='client')
        serializer = self.get_serializer(clients, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def client_details(self, request, pk=None):
        """
        Szczegóły klienta
        """
        client = self.get_object()
        serializer = self.get_serializer(client)
        return Response(serializer.data)