from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from ..serializers import WorkshopSerializer
from ..models import Workshop


class WorkshopViewSet(viewsets.ModelViewSet):
    queryset = Workshop.objects.all()
    serializer_class = WorkshopSerializer

    # Jeśli chcesz dodać dodatkową logikę do widoku szczegółowego, np. filtrowanie, możesz to zrobić
    def retrieve(self, request, *args, **kwargs):
        try:
            workshop = self.get_object()  # Pobierz warsztat na podstawie ID
        except Workshop.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(workshop)
        return Response(serializer.data)
