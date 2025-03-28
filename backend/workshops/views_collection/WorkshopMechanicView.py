from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from ..serializers import WorkshopMechanicSerializer
from ..models import WorkshopMechanic

class WorkshopMechanicViewSet(viewsets.ModelViewSet):
    queryset = WorkshopMechanic.objects.all()
    serializer_class = WorkshopMechanicSerializer

    def retrieve(self, request, *args, **kwargs):
        try:
            workshop_mechanic = self.get_object()  # Pobierz mechanika na podstawie ID
        except WorkshopMechanic.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(workshop_mechanic)
        return Response(serializer.data)
