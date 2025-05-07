from backend.views_collection.BaseView import BaseViewSet
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiResponse
from ..services.workshopMechanicService import WorkshopMechanicService
from ..serializers import WorkshopMechanicSerializer

@extend_schema_view(
    list=extend_schema(
        summary="List all workshop mechanics",
        description="Retrieve a list of all workshop mechanics in the system.",
        responses={200: WorkshopMechanicSerializer(many=True)}
    ),
    retrieve=extend_schema(
        summary="Retrieve workshop mechanic details",
        description="Retrieve detailed information about a specific workshop mechanic.",
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, description="Mechanic ID", required=True, type=int)],
        responses={200: WorkshopMechanicSerializer, 404: OpenApiResponse(description="Mechanic not found")}
    ),
    create=extend_schema(
        summary="Create a new workshop mechanic",
        description="Create a new workshop mechanic entry in the system.",
        request=WorkshopMechanicSerializer,
        responses={201: WorkshopMechanicSerializer, 400: OpenApiResponse(description="Invalid data")}
    ),
    destroy=extend_schema(
        summary="Delete a workshop mechanic",
        description="Delete a specific workshop mechanic by ID.",
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, description="Mechanic ID", required=True, type=int)],
        responses={204: OpenApiResponse(description="No content"), 404: OpenApiResponse(description="Mechanic not found")}
    ),
    update=extend_schema(
        summary="Update a workshop mechanic",
        description="Update a specific workshop mechanic by ID.",
        request=WorkshopMechanicSerializer,
        responses={200: WorkshopMechanicSerializer, 404: OpenApiResponse(description="Mechanic not found")}
    ),
    partial_update=extend_schema(
        summary="Partially update a workshop mechanic",
        description="Partially update a specific workshop mechanic by ID.",
        request=WorkshopMechanicSerializer,
        responses={200: WorkshopMechanicSerializer, 404: OpenApiResponse(description="Mechanic not found")}
    )
)
class WorkshopMechanicViewSet(BaseViewSet):
    service = WorkshopMechanicService
    serializer_class = WorkshopMechanicSerializer