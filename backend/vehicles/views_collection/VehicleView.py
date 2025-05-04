from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from ..services.vehicleService import VehicleService
from ..serializers import VehicleSerializer

class VehicleViewSet(viewsets.ViewSet):
    """
    ViewSet for managing vehicles.
    Provides endpoints for retrieving, creating, updating, and deleting vehicles.
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return VehicleService.get_all_vehicles()

    @extend_schema(
        summary="List all vehicles",
        description="Retrieve a list of all vehicles in the system.",
        responses={200: VehicleSerializer(many=True)}
    )
    def list(self, request):
        vehicles = self.get_queryset()
        serializer = VehicleSerializer(vehicles, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Retrieve vehicle details",
        description="Retrieve detailed information about a specific vehicle.",
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, description="Vehicle ID", required=True, type=int)],
        responses={200: VehicleSerializer, 404: {"description": "Vehicle not found"}}
    )
    def retrieve(self, request, pk=None):
        vehicle_details = VehicleService.get_vehicle_details(pk)
        if not vehicle_details:
            return Response({"error": "Vehicle not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(vehicle_details)

    @extend_schema(
        summary="Create a new vehicle",
        description="Create a new vehicle entry in the system.",
        request=VehicleSerializer,
        responses={201: VehicleSerializer, 400: {"description": "Invalid data"}}
    )
    def create(self, request):
        serializer = VehicleSerializer(data=request.data)
        if serializer.is_valid():
            vehicle_details = VehicleService.create_vehicle(serializer.validated_data)
            return Response(vehicle_details, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="List vehicles due for maintenance",
        description="Retrieve a list of vehicles that are due for maintenance.",
        responses={200: VehicleSerializer(many=True)}
    )
    @action(detail=False, methods=['get'])
    def due_for_maintenance(self, request):
        vehicles = VehicleService.get_vehicles_due_for_maintenance()
        serializer = VehicleSerializer(vehicles, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Delete a vehicle",
        description="Delete a specific vehicle by ID.",
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, description="Vehicle ID", required=True, type=int)],
        responses={204: None, 404: {"description": "Vehicle not found"}}
    )
    def destroy(self, request, pk=None):
        if VehicleService.delete_vehicle(pk):
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({"error": "Vehicle not found"}, status=status.HTTP_404_NOT_FOUND)

    @extend_schema(
        summary="Update a vehicle",
        description="Update a specific vehicle by ID.",
        request=VehicleSerializer,
        responses={200: VehicleSerializer, 404: {"description": "Vehicle not found"}}
    )
    def update(self, request, pk=None):
        updated_vehicle = VehicleService.update_vehicle_details(pk, **request.data)
        if not updated_vehicle:
            return Response({"error": "Vehicle not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(updated_vehicle)

    @extend_schema(
        summary="Partially update a vehicle",
        description="Partially update a specific vehicle by ID.",
        request=VehicleSerializer,
        responses={200: VehicleSerializer, 404: {"description": "Vehicle not found"}}
    )
    def partial_update(self, request, pk=None):
        updated_vehicle = VehicleService.update_vehicle_details(pk, **request.data)
        if not updated_vehicle:
            return Response({"error": "Vehicle not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(updated_vehicle)