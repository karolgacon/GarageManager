from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from ..models import LoyaltyPoints
from ..serializers import LoyaltyPointsSerializer

class LoyaltyProgramViewAPI(ModelViewSet):
    serializer_class = LoyaltyPointsSerializer
    permission_classes = [IsAuthenticated]
    queryset = LoyaltyPoints.objects.all()

    def get_queryset(self):
        """Zwraca program lojalnościowy powiązany z użytkownikiem."""
        return self.queryset.filter(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='my-loyalty-status')
    def my_loyalty_status(self, request):
        """Zwraca status lojalnościowy aktualnie zalogowanego użytkownika."""
        loyalty = get_object_or_404(LoyaltyPoints, user=request.user)
        serializer = self.serializer_class(loyalty)
        return Response(serializer.data)