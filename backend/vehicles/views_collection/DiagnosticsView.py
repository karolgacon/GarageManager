from backend.views_collection.BaseView import BaseViewSet
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiResponse
from ..services.diagnosticsService import DiagnosticsService
from ..serializers import DiagnosticsSerializer
from rest_framework.decorators import action
from rest_framework.response import Response

@extend_schema_view(
    list=extend_schema(
        summary="List all diagnostics",
        description="Retrieve a list of all diagnostics in the system.",
        responses={200: DiagnosticsSerializer(many=True)}
    ),
    retrieve=extend_schema(
        summary="Retrieve diagnostic details",
        description="Retrieve detailed information about a specific diagnostic.",
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, description="Diagnostic ID", required=True, type=int)],
        responses={200: DiagnosticsSerializer, 404: OpenApiResponse(description="Diagnostic not found")}
    ),
    create=extend_schema(
        summary="Create a new diagnostic",
        description="Create a new diagnostic entry.",
        request=DiagnosticsSerializer,
        responses={201: DiagnosticsSerializer, 400: OpenApiResponse(description="Invalid data")}
    ),
    destroy=extend_schema(
        summary="Delete a diagnostic",
        description="Delete a specific diagnostic by ID.",
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, description="Diagnostic ID", required=True, type=int)],
        responses={204: OpenApiResponse(description="No content"), 404: OpenApiResponse(description="Diagnostic not found")}
    ),
    update=extend_schema(
        summary="Update a diagnostic",
        description="Update a specific diagnostic by ID.",
        request=DiagnosticsSerializer,
        responses={200: DiagnosticsSerializer, 404: OpenApiResponse(description="Diagnostic not found")}
    ),
    partial_update=extend_schema(
        summary="Partially update a diagnostic",
        description="Partially update a specific diagnostic by ID.",
        request=DiagnosticsSerializer,
        responses={200: DiagnosticsSerializer, 404: OpenApiResponse(description="Diagnostic not found")}
    )
)
class DiagnosticsViewSet(BaseViewSet):
    service = DiagnosticsService
    serializer_class = DiagnosticsSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="List critical diagnostics",
        description="Retrieve a list of diagnostics with a critical severity level.",
        responses={200: DiagnosticsSerializer(many=True)}
    )
    @action(detail=False, methods=['get'])
    def critical(self, request):
        """
        Pobiera diagnostykę oznaczoną jako krytyczną.
        """
        diagnostics = self.service.get_critical_diagnostics()
        serializer = self.serializer_class(diagnostics, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="List diagnostics by vehicle",
        description="Retrieve a list of diagnostics for a specific vehicle.",
        parameters=[
            OpenApiParameter(name="vehicle_id", location=OpenApiParameter.PATH, description="Vehicle ID", required=True, type=int)
        ],
        responses={200: DiagnosticsSerializer(many=True)}
    )
    @action(detail=False, methods=['get'], url_path='vehicle/(?P<vehicle_id>[^/.]+)')
    def vehicle(self, request, vehicle_id=None):
        """
        Pobiera diagnostykę dla danego pojazdu.
        """
        try:
            vehicle_id = int(vehicle_id)
            diagnostics = self.service.get_diagnostics_by_vehicle(vehicle_id)
            serializer = self.serializer_class(diagnostics, many=True)
            return Response(serializer.data)
        except ValueError:
            return Response(
                {"detail": "Invalid vehicle ID format."},
                status=400
            )
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=500
            )