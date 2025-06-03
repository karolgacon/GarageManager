from backend.views_collection.BaseView import BaseViewSet
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiResponse
from ..services.maintenanceScheduleService import MaintenanceScheduleService
from ..serializers import MaintenanceScheduleSerializer
from rest_framework.decorators import action
from rest_framework.response import Response

@extend_schema_view(
    list=extend_schema(
        summary="List all maintenance schedules",
        description="Retrieve a list of all maintenance schedules in the system.",
        responses={200: MaintenanceScheduleSerializer(many=True)}
    ),
    retrieve=extend_schema(
        summary="Retrieve maintenance schedule details",
        description="Retrieve detailed information about a specific maintenance schedule.",
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, description="Schedule ID", required=True, type=int)],
        responses={200: MaintenanceScheduleSerializer, 404: OpenApiResponse(description="Schedule not found")}
    ),
    create=extend_schema(
        summary="Create a new maintenance schedule",
        description="Create a new maintenance schedule entry in the system.",
        request=MaintenanceScheduleSerializer,
        responses={201: MaintenanceScheduleSerializer, 400: OpenApiResponse(description="Invalid data")}
    ),
    destroy=extend_schema(
        summary="Delete a maintenance schedule",
        description="Delete a specific maintenance schedule by ID.",
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, description="Schedule ID", required=True, type=int)],
        responses={204: OpenApiResponse(description="No content"), 404: OpenApiResponse(description="Schedule not found")}
    ),
    update=extend_schema(
        summary="Update a maintenance schedule",
        description="Update a specific maintenance schedule by ID.",
        request=MaintenanceScheduleSerializer,
        responses={200: MaintenanceScheduleSerializer, 404: OpenApiResponse(description="Schedule not found")}
    ),
    partial_update=extend_schema(
        summary="Partially update a maintenance schedule",
        description="Partially update a specific maintenance schedule by ID.",
        request=MaintenanceScheduleSerializer,
        responses={200: MaintenanceScheduleSerializer, 404: OpenApiResponse(description="Schedule not found")}
    )
)
class MaintenanceScheduleViewSet(BaseViewSet):
    service = MaintenanceScheduleService
    serializer_class = MaintenanceScheduleSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="List due maintenance schedules",
        description="Retrieve a list of maintenance schedules that are due.",
        parameters=[
            OpenApiParameter(name="client_id", type=int, location=OpenApiParameter.QUERY, 
                            description="Filter schedules by client ID")
        ],
        responses={200: MaintenanceScheduleSerializer(many=True)}
    )
    @action(detail=False, methods=['get'])
    def due_schedules(self, request):
        """
        Pobiera harmonogramy przeglądów, które są zaległe.
        Opcjonalnie można filtrować po ID klienta.
        """
        client_id = request.query_params.get('client_id')
        schedules = self.service.get_due_maintenance_schedules(client_id)
        serializer = self.serializer_class(schedules, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Get maintenance schedules by client",
        description="Retrieve all maintenance schedules for a specific client's vehicles.",
        parameters=[
            OpenApiParameter(name="client_id", type=int, location=OpenApiParameter.QUERY, 
                            description="Client ID to filter schedules", required=True)
        ],
        responses={200: MaintenanceScheduleSerializer(many=True)}
    )
    @action(detail=False, methods=['get'], url_path='by_client')
    def by_client(self, request):
        """
        Pobiera harmonogram przeglądów dla wszystkich pojazdów danego klienta.
        """
        client_id = request.query_params.get('client_id')
        if not client_id:
            return Response({"error": "client_id parameter is required"}, status=400)
            
        schedules = self.service.get_maintenance_schedule_by_client(client_id)
        serializer = self.serializer_class(schedules, many=True)
        return Response(serializer.data)