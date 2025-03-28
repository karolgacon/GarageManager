from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from ..serializers import ReportSerializer
from ..models import Report

class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer

    def retrieve(self, request, *args, **kwargs):
        try:
            report = self.get_object()  # Pobierz raport na podstawie ID
        except Report.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(report)
        return Response(serializer.data)