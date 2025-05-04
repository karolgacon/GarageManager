from backend.views_collection.BaseView import BaseViewSet
from ..services.appointmentsService import AppointmentService
from ..serializers import AppointmentSerializer
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404

class AppointmentViewSet(BaseViewSet):
    service = AppointmentService
    serializer_class = AppointmentSerializer

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
                appointments = self.service.get_appointments_by_client(client_id)
                serializer = self.serializer_class(appointments, many=True)
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
                appointments = self.service.get_appointments_by_workshop(workshop_id)
                serializer = self.serializer_class(appointments, many=True)
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
                appointments = self.service.get_appointments_by_vehicle(vehicle_id)
                serializer = self.serializer_class(appointments, many=True)
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
                appointments = self.service.get_appointments_by_status(status_value)
                serializer = self.serializer_class(appointments, many=True)
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
                appointments = self.service.get_appointments_by_priority(priority_value)
                serializer = self.serializer_class(appointments, many=True)
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