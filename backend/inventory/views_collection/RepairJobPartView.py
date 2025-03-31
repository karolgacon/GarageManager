from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from ..models import RepairJobPart
from ..serializers import RepairJobPartSerializer

class RepairJobPartViewSet(viewsets.ModelViewSet):
    queryset = RepairJobPart.objects.all()
    serializer_class = RepairJobPartSerializer
    permission_classes = [IsAuthenticated]