from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from ..models import MaintenanceSchedule
from ..serializers import MaintenanceScheduleSerializer

class MaintenanceScheduleViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceSchedule.objects.all()
    serializer_class = MaintenanceScheduleSerializer
    permission_classes = [IsAuthenticated]