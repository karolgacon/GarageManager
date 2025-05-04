from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from drf_spectacular.types import OpenApiTypes
from ..serializers import RepairJobSerializer
from ..services.repairJobsService import RepairJobService
from django.http import Http404
from django.forms import ValidationError

class RepairJobViewSet(viewsets.ViewSet):
    """
    ViewSet for managing repair jobs.
    Handles CRUD operations for repair jobs.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="List all repair jobs",
        description="Returns a list of all repair jobs.",
        responses={200: RepairJobSerializer(many=True)}
    )
    def list(self, request):
        """List all repair jobs."""
        repair_jobs = RepairJobService.get_all_repair_jobs()
        serializer = RepairJobSerializer(repair_jobs, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Retrieve repair job details",
        description="Returns details of a specific repair job.",
        responses={200: RepairJobSerializer, 404: OpenApiResponse(description="Repair job not found")}
    )
    def retrieve(self, request, pk=None):
        """Retrieve details of a specific repair job."""
        try:
            repair_job = RepairJobService.get_repair_job_by_id(pk)
            serializer = RepairJobSerializer(repair_job)
            return Response(serializer.data)
        except Http404:
            return Response(
                {"error": "Repair job not found"},
                status=status.HTTP_404_NOT_FOUND
            )

    @extend_schema(
        summary="Create a new repair job",
        description="Creates a new repair job with details such as mechanic, appointment, and job description.",
        request=RepairJobSerializer,
        responses={201: RepairJobSerializer, 400: OpenApiResponse(description="Validation error")}
    )
    def create(self, request):
        """Create a new repair job."""
        try:
            repair_job = RepairJobService.create_repair_job(request.data)
            serializer = RepairJobSerializer(repair_job)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response(
                {"error": e.message_dict},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(
        summary="Update a repair job",
        description="Updates an existing repair job.",
        request=RepairJobSerializer,
        responses={200: RepairJobSerializer, 404: OpenApiResponse(description="Repair job not found")}
    )
    def update(self, request, pk=None):
        """Update an existing repair job."""
        try:
            repair_job = RepairJobService.update_repair_job(pk, request.data)
            serializer = RepairJobSerializer(repair_job)
            return Response(serializer.data)
        except Http404:
            return Response(
                {"error": "Repair job not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValidationError as e:
            return Response(
                {"error": e.message_dict},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(
        summary="Partially update a repair job",
        description="Partially updates fields of a repair job.",
        request=RepairJobSerializer,
        responses={200: RepairJobSerializer, 404: OpenApiResponse(description="Repair job not found")}
    )
    def partial_update(self, request, pk=None):
        """Partially update a repair job."""
        try:
            repair_job = RepairJobService.partially_update_repair_job(pk, request.data)
            serializer = RepairJobSerializer(repair_job)
            return Response(serializer.data)
        except Http404:
            return Response(
                {"error": "Repair job not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValidationError as e:
            return Response(
                {"error": e.message_dict},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(
        summary="Delete a repair job",
        description="Deletes a repair job from the system.",
        responses={204: OpenApiResponse(description="No content"), 404: OpenApiResponse(description="Repair job not found")}
    )
    def destroy(self, request, pk=None):
        """Delete a repair job."""
        try:
            RepairJobService.delete_repair_job(pk)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Http404:
            return Response(
                {"error": "Repair job not found"},
                status=status.HTTP_404_NOT_FOUND
            )

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
                repair_jobs = RepairJobService.get_repair_jobs_by_mechanic(mechanic_id)
                serializer = RepairJobSerializer(repair_jobs, many=True)
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
                repair_jobs = RepairJobService.get_repair_jobs_by_appointment(appointment_id)
                serializer = RepairJobSerializer(repair_jobs, many=True)
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