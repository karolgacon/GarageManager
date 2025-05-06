from backend.views_collection.BaseView import BaseViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, extend_schema_view
from ..services.mechanicService import MechanicService
from ..serializers import UserSerializer
from ..permissions import IsMechanic

@extend_schema_view(
    list=extend_schema(
        summary="List all clients",
        description="Returns a list of all clients.",
        responses={200: UserSerializer(many=True)}
    )
)
class MechanicViewSet(BaseViewSet):
    service = MechanicService
    serializer_class = UserSerializer
    permission_classes = [IsMechanic]

    @extend_schema(
        summary="Mechanic dashboard",
        description="Returns statistics for the mechanic dashboard.",
        responses={200: "Dashboard statistics"}
    )
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """
        Panel główny mechanika.
        """
        total_clients = self.service.get_all_clients().count()
        return Response({
            'total_clients': total_clients,
            # Możesz dodać inne statystyki tutaj
        })

    @extend_schema(
        summary="List all clients",
        description="Returns a list of all clients.",
        responses={200: UserSerializer(many=True)}
    )
    @action(detail=False, methods=['get'])
    def clients(self, request):
        """
        Lista wszystkich klientów.
        """
        clients = self.service.get_all_clients()
        serializer = self.serializer_class(clients, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Client details",
        description="Returns details of a specific client.",
        responses={200: UserSerializer, 404: "Client not found"}
    )
    @action(detail=True, methods=['get'])
    def client_details(self, request, pk=None):
        """
        Szczegóły klienta.
        """
        try:
            client = self.service.get_client_details(pk)
            serializer = self.serializer_class(client)
            return Response(serializer.data)
        except Exception:
            return Response({"error": "Client not found"}, status=404)