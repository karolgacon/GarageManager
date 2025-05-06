from backend.views_collection.BaseView import BaseViewSet
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework.response import Response
from rest_framework.decorators import action
from ..services.loyaltyPointsService import LoyaltyPointsService
from ..serializers import LoyaltyPointsSerializer
from django.core.exceptions import ValidationError

@extend_schema_view(
    list=extend_schema(
        summary="List all loyalty points",
        description="Returns a list of all loyalty points entries.",
        responses={200: LoyaltyPointsSerializer(many=True)}
    )
)
class LoyaltyProgramViewSet(BaseViewSet):
    service = LoyaltyPointsService
    serializer_class = LoyaltyPointsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Zwraca program lojalnościowy powiązany z aktualnie zalogowanym użytkownikiem.
        """
        return self.service.repository.get_all().filter(user=self.request.user)

    @extend_schema(
        summary="Get current user's loyalty status",
        description="Returns the loyalty status of the currently authenticated user.",
        responses={200: LoyaltyPointsSerializer, 404: "Loyalty points not found"}
    )
    @action(detail=False, methods=['get'], url_path='my-loyalty-status')
    def my_loyalty_status(self, request):
        """
        Zwraca status lojalnościowy aktualnie zalogowanego użytkownika.
        """
        try:
            loyalty = self.service.get_loyalty_status(request.user)
            serializer = self.serializer_class(loyalty)
            return Response(serializer.data, status=200)
        except ValidationError as e:
            return Response({"error": str(e)}, status=404)