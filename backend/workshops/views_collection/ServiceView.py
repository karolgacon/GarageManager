from backend.views_collection.BaseView import BaseViewSet
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiResponse
from ..services.serviceService import ServiceService
from ..serializers import ServiceSerializer

@extend_schema_view(
    list=extend_schema(
        summary="List all services",
        description="Retrieve a list of all services in the system.",
        responses={200: ServiceSerializer(many=True)}
    ),
    retrieve=extend_schema(
        summary="Retrieve service details",
        description="Retrieve detailed information about a specific service.",
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, description="Service ID", required=True, type=int)],
        responses={200: ServiceSerializer, 404: OpenApiResponse(description="Service not found")}
    ),
    create=extend_schema(
        summary="Create a new service",
        description="Create a new service entry in the system.",
        request=ServiceSerializer,
        responses={201: ServiceSerializer, 400: OpenApiResponse(description="Invalid data")}
    ),
    destroy=extend_schema(
        summary="Delete a service",
        description="Delete a specific service by ID.",
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, description="Service ID", required=True, type=int)],
        responses={204: OpenApiResponse(description="No content"), 404: OpenApiResponse(description="Service not found")}
    ),
    update=extend_schema(
        summary="Update a service",
        description="Update a specific service by ID.",
        request=ServiceSerializer,
        responses={200: ServiceSerializer, 404: OpenApiResponse(description="Service not found")}
    ),
    partial_update=extend_schema(
        summary="Partially update a service",
        description="Partially update a specific service by ID.",
        request=ServiceSerializer,
        responses={200: ServiceSerializer, 404: OpenApiResponse(description="Service not found")}
    )
)
class ServiceViewSet(BaseViewSet):
    service = ServiceService
    serializer_class = ServiceSerializer