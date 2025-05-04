from django.forms import ValidationError
from django.http import Http404
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse
from ..serializers import AppointmentSerializer
from ..services.appointmentsService import AppointmentService
from rest_framework.decorators import action
from drf_spectacular.utils import extend_schema, OpenApiParameter

class AppointmentViewSet(viewsets.ViewSet):
    """
    ViewSet for managing appointments.
    Allows creating, retrieving, updating, and deleting appointments.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="List all appointments",
        description="Returns a list of all available appointments.",
        responses={200: AppointmentSerializer(many=True)}
    )
    def list(self, request):
        """List all appointments."""
        appointments = AppointmentService.get_all_appointments()
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Retrieve appointment details",
        description="Returns details of a specific appointment.",
        responses={200: AppointmentSerializer, 404: OpenApiResponse(description="Appointment not found")}
    )
    def retrieve(self, request, pk=None):
        """Retrieve details of a specific appointment."""
        try:
            appointment = AppointmentService.get_appointment_by_id(pk)
            serializer = AppointmentSerializer(appointment)
            return Response(serializer.data)
        except Http404:
            return Response(
                {"error": "Appointment not found"},
                status=status.HTTP_404_NOT_FOUND
            )

    @extend_schema(
        summary="Create a new appointment",
        description="Creates a new appointment with client, workshop, vehicle, and other details.",
        request=AppointmentSerializer,
        responses={201: AppointmentSerializer, 400: OpenApiResponse(description="Validation error")}
    )
    def create(self, request):
        """Create a new appointment."""
        try:
            appointment = AppointmentService.create_appointment(request.data)
            serializer = AppointmentSerializer(appointment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response(
                {"error": e.message_dict},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(
        summary="Update an appointment",
        description="Updates an existing appointment.",
        request=AppointmentSerializer,
        responses={200: AppointmentSerializer, 404: OpenApiResponse(description="Appointment not found")}
    )
    def update(self, request, pk=None):
        """Update an existing appointment."""
        try:
            appointment = AppointmentService.update_appointment(pk, request.data)
            serializer = AppointmentSerializer(appointment)
            return Response(serializer.data)
        except Http404:
            return Response(
                {"error": "Appointment not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValidationError as e:
            return Response(
                {"error": e.message_dict},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(
        summary="Partially update an appointment",
        description="Partially updates fields of an appointment.",
        request=AppointmentSerializer,
        responses={200: AppointmentSerializer, 404: OpenApiResponse(description="Appointment not found")}
    )
    def partial_update(self, request, pk=None):
        """Partially update an appointment."""
        try:
            appointment = AppointmentService.partially_update_appointment(pk, request.data)
            serializer = AppointmentSerializer(appointment)
            return Response(serializer.data)
        except Http404:
            return Response(
                {"error": "Appointment not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValidationError as e:
            return Response(
                {"error": e.message_dict},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(
        summary="Delete an appointment",
        description="Deletes an appointment from the system.",
        responses={204: OpenApiResponse(description="No content"), 404: OpenApiResponse(description="Appointment not found")}
    )
    def destroy(self, request, pk=None):
        """Delete an appointment."""
        try:
            AppointmentService.delete_appointment(pk)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Http404:
            return Response(
                {"error": "Appointment not found"},
                status=status.HTTP_404_NOT_FOUND
            )

    @extend_schema(
        summary="Retrieve appointments for a specific client",
        description="Returns a list of appointments for a specific client.",
        parameters=[OpenApiParameter(name="client_id", description="ID of the client", required=True, type=str)],
        responses={200: AppointmentSerializer(many=True), 404: OpenApiResponse(description="No appointments found")}
    )
    @action(detail=False, methods=['get'])
    def by_client(self, request):
        """Retrieve appointments for a specific client."""
        client_id = request.query_params.get('client_id')
        if client_id:
            try:
                appointments = AppointmentService.get_appointments_by_client(client_id)
                serializer = AppointmentSerializer(appointments, many=True)
                return Response(serializer.data)
            except Http404:
                return Response(
                    {"error": "No appointments found for the specified client."},
                    status=status.HTTP_404_NOT_FOUND
                )
        return Response(
            {"error": "The 'client_id' parameter is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    @extend_schema(
        summary="Retrieve appointments for a specific workshop",
        description="Returns a list of appointments for a specific workshop.",
        parameters=[OpenApiParameter(name="workshop_id", description="ID of the workshop", required=True, type=str)],
        responses={200: AppointmentSerializer(many=True), 404: OpenApiResponse(description="No appointments found")}
    )
    @action(detail=False, methods=['get'])
    def by_workshop(self, request):
        """Retrieve appointments for a specific workshop."""
        workshop_id = request.query_params.get('workshop_id')
        if workshop_id:
            try:
                appointments = AppointmentService.get_appointments_by_workshop(workshop_id)
                serializer = AppointmentSerializer(appointments, many=True)
                return Response(serializer.data)
            except Http404:
                return Response(
                    {"error": "No appointments found for the specified workshop."},
                    status=status.HTTP_404_NOT_FOUND
                )
        return Response(
            {"error": "The 'workshop_id' parameter is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    @extend_schema(
        summary="Retrieve appointments for a specific vehicle",
        description="Returns a list of appointments for a specific vehicle.",
        parameters=[OpenApiParameter(name="vehicle_id", description="ID of the vehicle", required=True, type=str)],
        responses={200: AppointmentSerializer(many=True), 404: OpenApiResponse(description="No appointments found")}
    )
    @action(detail=False, methods=['get'])
    def by_vehicle(self, request):
        """Retrieve appointments for a specific vehicle."""
        vehicle_id = request.query_params.get('vehicle_id')
        if vehicle_id:
            try:
                appointments = AppointmentService.get_appointments_by_vehicle(vehicle_id)
                serializer = AppointmentSerializer(appointments, many=True)
                return Response(serializer.data)
            except Http404:
                return Response(
                    {"error": "No appointments found for the specified vehicle."},
                    status=status.HTTP_404_NOT_FOUND
                )
        return Response(
            {"error": "The 'vehicle_id' parameter is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    @extend_schema(
        summary="Retrieve appointments with a specific status",
        description="Returns a list of appointments with a specific status.",
        parameters=[OpenApiParameter(name="status", description="Status of the appointments", required=True, type=str)],
        responses={200: AppointmentSerializer(many=True), 404: OpenApiResponse(description="No appointments found")}
    )
    @action(detail=False, methods=['get'])
    def by_status(self, request):
        """Retrieve appointments with a specific status."""
        status_value = request.query_params.get('status')
        if status_value:
            try:
                appointments = AppointmentService.get_appointments_by_status(status_value)
                serializer = AppointmentSerializer(appointments, many=True)
                return Response(serializer.data)
            except Http404:
                return Response(
                    {"error": "No appointments found with the specified status."},
                    status=status.HTTP_404_NOT_FOUND
                )
        return Response(
            {"error": "The 'status' parameter is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    @extend_schema(
        summary="Retrieve appointments with a specific priority",
        description="Returns a list of appointments with a specific priority.",
        parameters=[OpenApiParameter(name="priority", description="Priority of the appointments", required=True, type=str)],
        responses={200: AppointmentSerializer(many=True), 404: OpenApiResponse(description="No appointments found")}
    )
    @action(detail=False, methods=['get'])
    def by_priority(self, request):
        """Retrieve appointments with a specific priority."""
        priority_value = request.query_params.get('priority')
        if priority_value:
            try:
                appointments = AppointmentService.get_appointments_by_priority(priority_value)
                serializer = AppointmentSerializer(appointments, many=True)
                return Response(serializer.data)
            except Http404:
                return Response(
                    {"error": "No appointments found with the specified priority."},
                    status=status.HTTP_404_NOT_FOUND
                )
        return Response(
            {"error": "The 'priority' parameter is required."},
            status=status.HTTP_400_BAD_REQUEST
        )