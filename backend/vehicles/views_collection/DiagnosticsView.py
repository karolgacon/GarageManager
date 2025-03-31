from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from ..models import Diagnostics
from ..serializers import DiagnosticsSerializer

class DiagnosticsViewSet(viewsets.ModelViewSet):
    queryset = Diagnostics.objects.all()
    serializer_class = DiagnosticsSerializer
    permission_classes = [IsAuthenticated]