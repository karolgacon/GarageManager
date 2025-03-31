from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from ..serializers import UserSerializer, ProfileSerializer  # Zakładam, że masz już serializatory

User = get_user_model()


class OwnerPermission(permissions.BasePermission):
    """
    Niestandardowe uprawnienia dla właściciela
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'owner'


class OwnerViewSet(viewsets.ModelViewSet):
    """
    Widok dla właściciela warsztatu
    """
    queryset = User.objects.filter(role__in=['mechanic', 'client'])
    serializer_class = UserSerializer
    permission_classes = [OwnerPermission]

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """
        Panel główny właściciela z podsumowaniem danych
        """
        total_mechanics = User.objects.filter(role='mechanic').count()
        total_clients = User.objects.filter(role='client').count()

        return Response({
            'total_mechanics': total_mechanics,
            'total_clients': total_clients,
            # Inne statystyki dla właściciela
        })

    @action(detail=False, methods=['get'])
    def mechanics(self, request):
        """
        Lista wszystkich mechaników
        """
        mechanics = User.objects.filter(role='mechanic')
        serializer = self.get_serializer(mechanics, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_mechanic(self, request, pk=None):
        """
        Dodawanie nowego mechanika (zmiana roli istniejącego użytkownika)
        """
        user = self.get_object()
        user.role = 'mechanic'
        user.save()
        return Response({'status': 'user set as mechanic'})