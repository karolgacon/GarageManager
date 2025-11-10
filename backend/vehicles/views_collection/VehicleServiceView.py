from rest_framework import permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import Http404
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse

from backend.views_collection.BaseView import BaseViewSet
from ..models import VehicleService
from ..serializers import VehicleServiceSerializer
from ..services.VehicleServiceService import VehicleServiceService

class VehicleServiceViewSet(BaseViewSet):
    """
    API endpoint for vehicle services that filters based on user role and provides
    vehicle-specific and client-specific service views.
    """
    serializer_class = VehicleServiceSerializer
    service = VehicleServiceService()
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        """
        List services filtered based on user role.
        - If client: only show their own vehicles' services
        - If staff/admin: show all services
        """
        user = request.user

        if user.is_staff or user.is_superuser:
            records = self.service.get_all()
        else:

            records = self.service.get_by_filter(vehicle__owner=user)

        serializer = self.serializer_class(records, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Get services for a specific vehicle",
        parameters=[
            OpenApiParameter(name="vehicle_id", location="query", required=True, type=int)
        ],
        responses={
            200: VehicleServiceSerializer(many=True),
            400: OpenApiResponse(description="Vehicle ID is required")
        }
    )
    @action(detail=False, methods=['get'])
    def by_vehicle(self, request):
        """Get services for a specific vehicle"""
        vehicle_id = request.query_params.get('vehicle_id')
        if not vehicle_id:
            return Response({"error": "Vehicle ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:

            services = self.service.get_by_vehicle(vehicle_id)
            serializer = self.serializer_class(services, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Get all services for a client's vehicles",
        parameters=[
            OpenApiParameter(name="client_id", location="query", required=True, type=int)
        ],
        responses={
            200: VehicleServiceSerializer(many=True),
            400: OpenApiResponse(description="Client ID is required")
        }
    )
    @action(detail=False, methods=['get'])
    def by_client(self, request):
        """Get all services for a client's vehicles"""
        client_id = request.query_params.get('client_id')
        if not client_id:
            return Response({"error": "Client ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        if not request.user.is_staff and str(request.user.id) != client_id:
            return Response({"error": "You don't have permission to access this data"},
                            status=status.HTTP_403_FORBIDDEN)

        try:

            services = self.service.get_by_client(client_id)
            serializer = self.serializer_class(services, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Get all services for a workshop",
        parameters=[
            OpenApiParameter(name="workshop_id", location="query", required=True, type=int)
        ],
        responses={
            200: VehicleServiceSerializer(many=True),
            400: OpenApiResponse(description="Workshop ID is required"),
            403: OpenApiResponse(description="Permission denied")
        }
    )
    @action(detail=False, methods=['get'])
    def by_workshop(self, request):
        """Get all services for vehicles associated with a specific workshop"""
        workshop_id = request.query_params.get('workshop_id')
        if not workshop_id:
            return Response({"error": "Workshop ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if user is staff, admin, or owner of the workshop
        if not request.user.is_staff:
            # Check if user is owner of this workshop
            from workshops.models import Workshop
            try:
                workshop = Workshop.objects.get(id=workshop_id, owner=request.user)
            except Workshop.DoesNotExist:
                return Response({"error": "You don't have permission to access this workshop's data"},
                                status=status.HTTP_403_FORBIDDEN)

        try:
            services = self.service.get_by_workshop(workshop_id)
            serializer = self.serializer_class(services, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
