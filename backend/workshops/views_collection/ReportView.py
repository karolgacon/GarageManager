from backend.views_collection.BaseView import BaseViewSet
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiResponse
from ..services.reportService import ReportService
from ..serializers import ReportSerializer

@extend_schema_view(
    list=extend_schema(
        summary="List all reports",
        description="Retrieve a list of all reports in the system.",
        responses={200: ReportSerializer(many=True)}
    ),
    retrieve=extend_schema(
        summary="Retrieve report details",
        description="Retrieve detailed information about a specific report.",
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, description="Report ID", required=True, type=int)],
        responses={200: ReportSerializer, 404: OpenApiResponse(description="Report not found")}
    ),
    create=extend_schema(
        summary="Create a new report",
        description="Create a new report entry in the system.",
        request=ReportSerializer,
        responses={201: ReportSerializer, 400: OpenApiResponse(description="Invalid data")}
    ),
    destroy=extend_schema(
        summary="Delete a report",
        description="Delete a specific report by ID.",
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, description="Report ID", required=True, type=int)],
        responses={204: OpenApiResponse(description="No content"), 404: OpenApiResponse(description="Report not found")}
    ),
    update=extend_schema(
        summary="Update a report",
        description="Update a specific report by ID.",
        request=ReportSerializer,
        responses={200: ReportSerializer, 404: OpenApiResponse(description="Report not found")}
    ),
    partial_update=extend_schema(
        summary="Partially update a report",
        description="Partially update a specific report by ID.",
        request=ReportSerializer,
        responses={200: ReportSerializer, 404: OpenApiResponse(description="Report not found")}
    )
)
class ReportViewSet(BaseViewSet):
    service = ReportService
    serializer_class = ReportSerializer