from backend.views_collection.BaseView import BaseViewSet
from ..services.repairJobsService import RepairJobService
from ..serializers import RepairJobSerializer
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404

class RepairJobViewSet(BaseViewSet):
    service = RepairJobService
    serializer_class = RepairJobSerializer

    @extend_schema(
        summary="Retrieve repair jobs for a specific mechanic",
        description="Returns a list of repair jobs assigned to a specific mechanic.",
        parameters=[OpenApiParameter(name="mechanic_id", description="ID of the mechanic", required=True, type=int)],
        responses={200: RepairJobSerializer(many=True), 404: OpenApiResponse(description="No repair jobs found")}
    )
    @action(detail=False, methods=['get'])
    def by_mechanic(self, request):
        """Retrieve repair jobs for a specific mechanic."""
        mechanic_id = request.query_params.get('mechanic_id')
        if mechanic_id:
            try:
                repair_jobs = self.service.get_repair_jobs_by_mechanic(mechanic_id)
                serializer = self.serializer_class(repair_jobs, many=True)
                return Response(serializer.data)
            except Http404:
                return Response(
                    {"error": "No repair jobs found for the specified mechanic."},
                    status=status.HTTP_404_NOT_FOUND
                )
        return Response(
            {"error": "The 'mechanic_id' parameter is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    @extend_schema(
        summary="Retrieve repair jobs for a specific appointment",
        description="Returns a list of repair jobs associated with a specific appointment.",
        parameters=[OpenApiParameter(name="appointment_id", description="ID of the appointment", required=True, type=int)],
        responses={200: RepairJobSerializer(many=True), 404: OpenApiResponse(description="No repair jobs found")}
    )
    @action(detail=False, methods=['get'])
    def by_appointment(self, request):
        """Retrieve repair jobs for a specific appointment."""
        appointment_id = request.query_params.get('appointment_id')
        if appointment_id:
            try:
                repair_jobs = self.service.get_repair_jobs_by_appointment(appointment_id)
                serializer = self.serializer_class(repair_jobs, many=True)
                return Response(serializer.data)
            except Http404:
                return Response(
                    {"error": "No repair jobs found for the specified appointment."},
                    status=status.HTTP_404_NOT_FOUND
                )
        return Response(
            {"error": "The 'appointment_id' parameter is required."},
            status=status.HTTP_400_BAD_REQUEST
        )