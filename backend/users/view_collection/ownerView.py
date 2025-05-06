from backend.views_collection.BaseView import BaseViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, extend_schema_view
from ..services.ownerService import OwnerService
from ..serializers import UserSerializer
from ..permissions import IsOwner

@extend_schema_view(
    list=extend_schema(
        summary="List all users",
        description="Returns a list of all users (mechanics and clients).",
        responses={200: UserSerializer(many=True)}
    )
)
class OwnerViewSet(BaseViewSet):
    service = OwnerService
    serializer_class = UserSerializer
    permission_classes = [IsOwner]

    @extend_schema(
        summary="Owner dashboard",
        description="Returns statistics for the owner dashboard.",
        responses={200: "Dashboard statistics"}
    )
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """
        Panel główny właściciela.
        """
        total_mechanics = self.service.get_mechanics().count()
        total_clients = self.service.get_clients().count()
        return Response({
            'total_mechanics': total_mechanics,
            'total_clients': total_clients,
        })

    @extend_schema(
        summary="List all mechanics",
        description="Returns a list of all mechanics.",
        responses={200: UserSerializer(many=True)}
    )
    @action(detail=False, methods=['get'])
    def mechanics(self, request):
        """
        Lista wszystkich mechaników.
        """
        mechanics = self.service.get_mechanics()
        serializer = self.serializer_class(mechanics, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Add a mechanic",
        description="Sets the role of a user to 'mechanic'.",
        responses={200: UserSerializer, 404: "User not found"}
    )
    @action(detail=True, methods=['post'])
    def add_mechanic(self, request, pk=None):
        """
        Dodawanie nowego mechanika (zmiana roli istniejącego użytkownika).
        """
        try:
            user = self.service.add_mechanic(pk)
            serializer = self.serializer_class(user)
            return Response(serializer.data)
        except ValueError as e:
            return Response({"error": str(e)}, status=404)