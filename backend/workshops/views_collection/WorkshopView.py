from backend.views_collection.BaseView import BaseViewSet
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiResponse
from ..services.workshopService import WorkshopService
from ..serializers import WorkshopSerializer

@extend_schema_view(
    list=extend_schema(
        summary="List all workshops",
        description="Retrieve a list of all workshops in the system.",
        responses={200: WorkshopSerializer(many=True)}
    ),
    retrieve=extend_schema(
        summary="Retrieve workshop details",
        description="Retrieve detailed information about a specific workshop.",
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, description="Workshop ID", required=True, type=int)],
        responses={200: WorkshopSerializer, 404: OpenApiResponse(description="Workshop not found")}
    ),
    create=extend_schema(
        summary="Create a new workshop",
        description="Create a new workshop entry in the system.",
        request=WorkshopSerializer,
        responses={201: WorkshopSerializer, 400: OpenApiResponse(description="Invalid data")}
    ),
    destroy=extend_schema(
        summary="Delete a workshop",
        description="Delete a specific workshop by ID.",
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, description="Workshop ID", required=True, type=int)],
        responses={204: OpenApiResponse(description="No content"), 404: OpenApiResponse(description="Workshop not found")}
    ),
    update=extend_schema(
        summary="Update a workshop",
        description="Update a specific workshop by ID.",
        request=WorkshopSerializer,
        responses={200: WorkshopSerializer, 404: OpenApiResponse(description="Workshop not found")}
    ),
    partial_update=extend_schema(
        summary="Partially update a workshop",
        description="Partially update a specific workshop by ID.",
        request=WorkshopSerializer,
        responses={200: WorkshopSerializer, 404: OpenApiResponse(description="Workshop not found")}
    )
)
class WorkshopViewSet(BaseViewSet):
    service = WorkshopService
    serializer_class = WorkshopSerializer