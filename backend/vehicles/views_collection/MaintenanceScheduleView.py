from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from ..services.maintenanceScheduleService import MaintenanceScheduleService
from ..models import MaintenanceSchedule
from ..serializers import MaintenanceScheduleSerializer

class MaintenanceScheduleViewSet(viewsets.ViewSet):
    """
    ViewSet for managing maintenance schedules.
    Provides endpoints for retrieving, creating, and managing maintenance schedules.
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return MaintenanceSchedule.objects.all()

    @extend_schema(
        summary="List all maintenance schedules",
        description="Retrieve a list of all maintenance schedules in the system.",
        responses={200: MaintenanceScheduleSerializer(many=True)}
    )
    def list(self, request):
        schedules = self.get_queryset()
        serializer = MaintenanceScheduleSerializer(schedules, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Retrieve maintenance schedule details",
        description="Retrieve detailed information about a specific maintenance schedule.",
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, description="Schedule ID", required=True, type=int)],
        responses={200: MaintenanceScheduleSerializer, 404: {"description": "Schedule not found"}}
    )
    def retrieve(self, request, pk=None):
        try:
            schedule = MaintenanceSchedule.objects.get(pk=pk)
            serializer = MaintenanceScheduleSerializer(schedule)
            return Response(serializer.data)
        except MaintenanceSchedule.DoesNotExist:
            return Response({"error": "Schedule not found"}, status=status.HTTP_404_NOT_FOUND)
        
    @extend_schema(
        summary="Create a new maintenance schedule",
        description="Create a new maintenance schedule entry in the system.",
        request=MaintenanceScheduleSerializer,
        responses={201: MaintenanceScheduleSerializer, 400: {"description": "Invalid data"}}
    )
    def create(self, request):
        serializer = MaintenanceScheduleSerializer(data=request.data)
        if serializer.is_valid():
            schedule = MaintenanceScheduleService.add_maintenance_schedule(serializer.validated_data)
            return Response(MaintenanceScheduleSerializer(schedule).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="List due maintenance schedules",
        description="Retrieve a list of maintenance schedules that are due.",
        responses={200: MaintenanceScheduleSerializer(many=True)}
    )
    @action(detail=False, methods=['get'])
    def due_schedules(self, request):
        schedules = MaintenanceScheduleService.get_due_maintenance_schedules()
        serializer = MaintenanceScheduleSerializer(schedules, many=True)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Delete a maintenance schedule",
        description="Delete a specific maintenance schedule by ID.",
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, description="Schedule ID", required=True, type=int)],
        responses={204: None, 404: {"description": "Schedule not found"}}
    )
    def destroy(self, request, pk=None):
        if MaintenanceScheduleService.delete_maintenance_schedule(pk):
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({"error": "Schedule not found"}, status=status.HTTP_404_NOT_FOUND)

    @extend_schema(
        summary="Update a maintenance schedule",
        description="Update a specific maintenance schedule by ID.",
        request=MaintenanceScheduleSerializer,
        responses={200: MaintenanceScheduleSerializer, 404: {"description": "Schedule not found"}}
    )
    def update(self, request, pk=None):
        try:
            schedule = MaintenanceSchedule.objects.get(pk=pk)
            serializer = MaintenanceScheduleSerializer(schedule, data=request.data, partial=False)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except MaintenanceSchedule.DoesNotExist:
            return Response({"error": "Schedule not found"}, status=status.HTTP_404_NOT_FOUND)

    @extend_schema(
        summary="Partially update a maintenance schedule",
        description="Partially update a specific maintenance schedule by ID.",
        request=MaintenanceScheduleSerializer,
        responses={200: MaintenanceScheduleSerializer, 404: {"description": "Schedule not found"}}
    )
    def partial_update(self, request, pk=None):
        try:
            schedule = MaintenanceSchedule.objects.get(pk=pk)
            serializer = MaintenanceScheduleSerializer(schedule, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except MaintenanceSchedule.DoesNotExist:
            return Response({"error": "Schedule not found"}, status=status.HTTP_404_NOT_FOUND)