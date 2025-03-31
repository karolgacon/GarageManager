from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from ..models import CustomerFeedback
from ..serializers import CustomerFeedbackSerializer

class CustomerFeedbackViewSet(viewsets.ModelViewSet):
    queryset = CustomerFeedback.objects.all()
    serializer_class = CustomerFeedbackSerializer
    permission_classes = [IsAuthenticated]