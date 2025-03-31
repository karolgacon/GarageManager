from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from ..models import Part
from ..serializers import PartSerializer

class PartViewSet(viewsets.ModelViewSet):
    queryset = Part.objects.all()
    serializer_class = PartSerializer
    permission_classes = [IsAuthenticated]