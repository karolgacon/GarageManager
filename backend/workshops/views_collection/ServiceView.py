from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiResponse
from django.shortcuts import get_object_or_404
from ..models import Service
from ..serializers import ServiceSerializer

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]  # Wszyscy muszą być zalogowani

    def get_queryset(self):
        """ Admin widzi wszystkie usługi, a zwykły użytkownik tylko te dostępne dla niego. """
        if self.request.user.is_staff:
            return Service.objects.all()  # Admin widzi wszystkie
        return Service.objects.filter(is_active=True)  # Zwykły użytkownik widzi tylko aktywne usługi

    @extend_schema(
        description="Create a new service (admin can create for anyone).",
        request=ServiceSerializer,
        responses={201: ServiceSerializer, 400: OpenApiResponse(description="Bad Request")}
    )
    def create(self, request, *args, **kwargs):
        """
        Admin może tworzyć usługi, zwykły użytkownik nie ma dostępu do tej funkcji.
        """
        if not request.user.is_staff:
            return Response({"detail": "You do not have permission to perform this action."}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        description="Retrieve a service by ID (admin can retrieve any, user can retrieve only active services).",
        responses={200: ServiceSerializer, 404: OpenApiResponse(description="Service not found")}
    )
    def retrieve(self, request, pk=None):
        """ Admin może pobrać dowolną usługę, użytkownik tylko aktywną. """
        if request.user.is_staff:
            service = get_object_or_404(Service, pk=pk)
        else:
            service = get_object_or_404(Service, pk=pk, is_active=True)

        serializer = self.get_serializer(service)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        description="Update a service (admin can update any, user cannot update).",
        request=ServiceSerializer,
        responses={200: ServiceSerializer, 400: OpenApiResponse(description="Bad Request")}
    )
    def update(self, request, pk=None):
        """ Admin może aktualizować dowolną usługę, użytkownik nie ma dostępu do tej funkcji. """
        if not request.user.is_staff:
            return Response({"detail": "You do not have permission to perform this action."}, status=status.HTTP_403_FORBIDDEN)

        service = get_object_or_404(Service, pk=pk)
        serializer = self.serializer_class(service, data=request.data, partial=False)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        description="Partially update a service (admin can update any, user cannot update).",
        request=ServiceSerializer,
        responses={200: ServiceSerializer, 400: OpenApiResponse(description="Bad Request")}
    )
    def partial_update(self, request, pk=None):
        """ Admin może częściowo aktualizować dowolną usługę, użytkownik nie ma dostępu do tej funkcji. """
        if not request.user.is_staff:
            return Response({"detail": "You do not have permission to perform this action."}, status=status.HTTP_403_FORBIDDEN)

        service = get_object_or_404(Service, pk=pk)
        serializer = self.serializer_class(service, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        description="Delete a service (admin can delete any, user cannot delete).",
        responses={204: OpenApiResponse(description="Service deleted"), 404: OpenApiResponse(description="Service not found")}
    )
    def destroy(self, request, pk=None):
        """ Admin może usuwać dowolne usługi, użytkownik nie ma dostępu do tej funkcji. """
        if not request.user.is_staff:
            return Response({"detail": "You do not have permission to perform this action."}, status=status.HTTP_403_FORBIDDEN)

        service = get_object_or_404(Service, pk=pk)
        service.delete()
        return Response({"message": "Service deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
