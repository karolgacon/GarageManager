from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from ..models import StockEntry
from ..serializers import StockEntrySerializer

class StockEntryViewSet(viewsets.ModelViewSet):
    queryset = StockEntry.objects.all()
    serializer_class = StockEntrySerializer
    permission_classes = [IsAuthenticated]