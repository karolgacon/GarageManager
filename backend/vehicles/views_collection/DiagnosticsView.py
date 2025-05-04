from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiParameter
from ..services.diagnosticsService import DiagnosticsService
from ..serializers import DiagnosticsSerializer

class DiagnosticsViewSet(viewsets.ViewSet):
    """
    ViewSet for managing diagnostics.
    Provides endpoints for retrieving, creating, updating, and deleting diagnostics.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="List all diagnostics",
        description="Retrieve a list of all diagnostics in the system.",
        responses={200: DiagnosticsSerializer(many=True)}
    )
    def list(self, request):
        diagnostics = DiagnosticsService.get_all_diagnostics()
        serializer = DiagnosticsSerializer(diagnostics, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Retrieve diagnostic details",
        description="Retrieve detailed information about a specific diagnostic.",
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, description="Diagnostic ID", required=True, type=int)],
        responses={200: DiagnosticsSerializer, 404: {"description": "Diagnostic not found"}}
    )
    def retrieve(self, request, pk=None):
        diagnostic = DiagnosticsService.get_diagnostic_by_id(pk)
        if not diagnostic:
            return Response({"error": "Diagnostic not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = DiagnosticsSerializer(diagnostic)
        return Response(serializer.data)

    @extend_schema(
        summary="Create a new diagnostic",
        description="Create a new diagnostic entry.",
        request=DiagnosticsSerializer,
        responses={201: DiagnosticsSerializer, 400: {"description": "Invalid data"}}
    )
    def create(self, request):
        serializer = DiagnosticsSerializer(data=request.data)
        if serializer.is_valid():
            diagnostic = DiagnosticsService.add_diagnostic(**serializer.validated_data)
            return Response(DiagnosticsSerializer(diagnostic).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="List critical diagnostics",
        description="Retrieve a list of diagnostics with a critical severity level.",
        responses={200: DiagnosticsSerializer(many=True)}
    )
    @action(detail=False, methods=['get'])
    def critical(self, request):
        diagnostics = DiagnosticsService.get_critical_diagnostics()
        serializer = DiagnosticsSerializer(diagnostics, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Delete a diagnostic",
        description="Delete a specific diagnostic by ID.",
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, description="Diagnostic ID", required=True, type=int)],
        responses={204: None, 404: {"description": "Diagnostic not found"}}
    )
    def destroy(self, request, pk=None):
        if DiagnosticsService.delete_diagnostic(pk):
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({"error": "Diagnostic not found"}, status=status.HTTP_404_NOT_FOUND)

    @extend_schema(
        summary="Update a diagnostic",
        description="Update a specific diagnostic by ID.",
        request=DiagnosticsSerializer,
        responses={200: DiagnosticsSerializer, 404: {"description": "Diagnostic not found"}}
    )
    def update(self, request, pk=None):
        diagnostic = DiagnosticsService.get_diagnostic_by_id(pk)
        if not diagnostic:
            return Response({"error": "Diagnostic not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = DiagnosticsSerializer(diagnostic, data=request.data, partial=False)
        if serializer.is_valid():
            updated_diagnostic = DiagnosticsService.update_diagnostic(pk, **serializer.validated_data)
            return Response(DiagnosticsSerializer(updated_diagnostic).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Partially update a diagnostic",
        description="Partially update a specific diagnostic by ID.",
        request=DiagnosticsSerializer,
        responses={200: DiagnosticsSerializer, 404: {"description": "Diagnostic not found"}}
    )
    def partial_update(self, request, pk=None):
        diagnostic = DiagnosticsService.get_diagnostic_by_id(pk)
        if not diagnostic:
            return Response({"error": "Diagnostic not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = DiagnosticsSerializer(diagnostic, data=request.data, partial=True)
        if serializer.is_valid():
            updated_diagnostic = DiagnosticsService.update_diagnostic(pk, **serializer.validated_data)
            return Response(DiagnosticsSerializer(updated_diagnostic).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)