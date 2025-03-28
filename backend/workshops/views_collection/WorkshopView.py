from rest_framework import viewsets
from ..models import Workshop, Service
from ..serializers import WorkshopSerializer, ServiceSerializer
from rest_framework.permissions import IsAuthenticated

class WorkshopViewSet(viewsets.ModelViewSet):
    queryset = Workshop.objects.all()
    serializer_class = WorkshopSerializer
    permission_classes = [IsAuthenticated]