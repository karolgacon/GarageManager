from backend.views_collection.BaseView import BaseViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action  # ✅ Dodaj ten import
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiResponse
from ..services.vehicleService import VehicleService
from ..serializers import VehicleSerializer

@extend_schema_view(
    list=extend_schema(
        summary="List all vehicles",
        description="Retrieve a list of all vehicles in the system.",
        responses={200: VehicleSerializer(many=True)}
    ),
    retrieve=extend_schema(
        summary="Retrieve vehicle details",
        description="Retrieve detailed information about a specific vehicle.",
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, description="Vehicle ID", required=True, type=int)],
        responses={200: VehicleSerializer, 404: OpenApiResponse(description="Vehicle not found")}
    ),
    create=extend_schema(
        summary="Create a new vehicle",
        description="Create a new vehicle entry in the system.",
        request=VehicleSerializer,
        responses={201: VehicleSerializer, 400: OpenApiResponse(description="Invalid data")}
    ),
    destroy=extend_schema(
        summary="Delete a vehicle",
        description="Delete a specific vehicle by ID.",
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, description="Vehicle ID", required=True, type=int)],
        responses={204: OpenApiResponse(description="No content"), 404: OpenApiResponse(description="Vehicle not found")}
    ),
    update=extend_schema(
        summary="Update a vehicle",
        description="Update a specific vehicle by ID.",
        request=VehicleSerializer,
        responses={200: VehicleSerializer, 404: OpenApiResponse(description="Vehicle not found")}
    ),
    partial_update=extend_schema(
        summary="Partially update a vehicle",
        description="Partially update a specific vehicle by ID.",
        request=VehicleSerializer,
        responses={200: VehicleSerializer, 404: OpenApiResponse(description="Vehicle not found")}
    )
)
class VehicleViewSet(BaseViewSet):
    service = VehicleService
    serializer_class = VehicleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Override get_queryset to handle filtering by owner
        """
        from ..models import Vehicle
        queryset = Vehicle.objects.all()
        
        # Filtruj po owner jeśli podany w query params
        owner_id = self.request.query_params.get('owner', None)
        if owner_id is not None:
            print(f"[DEBUG] Filtering vehicles by owner_id: {owner_id}")
            queryset = queryset.filter(owner_id=owner_id)
            print(f"[DEBUG] Found {queryset.count()} vehicles for owner {owner_id}")
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """
        Override list to add debugging
        """
        queryset = self.get_queryset()
        
        print(f"[DEBUG] Final queryset count: {queryset.count()}")
        for vehicle in queryset[:3]:  # Pokazuj pierwsze 3
            print(f"[DEBUG] Vehicle {vehicle.id}: owner={vehicle.owner_id}, brand={vehicle.brand}")
        
        # Wywołaj parent method zamiast robić to ręcznie
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="List vehicles due for maintenance",
        description="Retrieve a list of vehicles that are due for maintenance.",
        responses={200: VehicleSerializer(many=True)}
    )
    @action(detail=False, methods=['get'])
    def due_for_maintenance(self, request):
        """
        Pobiera pojazdy wymagające przeglądu technicznego.
        """
        vehicles = self.service.get_vehicles_due_for_maintenance()
        serializer = self.serializer_class(vehicles, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="List vehicles by brand",
        description="Retrieve a list of vehicles filtered by brand.",
        parameters=[OpenApiParameter(name="brand", location=OpenApiParameter.QUERY, description="Vehicle brand", required=True, type=str)],
        responses={200: VehicleSerializer(many=True)}
    )
    @action(detail=False, methods=['get'])
    def by_brand(self, request):
        """
        Pobiera pojazdy określonej marki.
        """
        brand = request.query_params.get("brand")
        if not brand:
            return Response({"error": "Brand is required"}, status=400)
        vehicles = self.service.get_vehicles_by_brand(brand)
        serializer = self.serializer_class(vehicles, many=True)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Get current user's vehicles",
        description="Retrieve vehicles owned by the current authenticated user",
        responses={200: VehicleSerializer(many=True)}
    )
    @action(detail=False, methods=['get'], url_path='my-vehicles')
    def my_vehicles(self, request):
        """
        Pobiera pojazdy należące do zalogowanego użytkownika.
        """
        user = request.user
        vehicles = self.service.get_vehicles_by_client(user.id)
        serializer = self.serializer_class(vehicles, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Get workshop vehicles",
        description="Retrieve vehicles associated with a specific workshop",
        parameters=[OpenApiParameter(name="workshop_id", location=OpenApiParameter.QUERY, description="Workshop ID", required=True, type=int)],
        responses={200: VehicleSerializer(many=True)}
    )
    @action(detail=False, methods=['get'])
    def workshop_vehicles(self, request):
        """
        Pobiera pojazdy przypisane do określonego warsztatu.
        """
        workshop_id = request.query_params.get("workshop_id")
        if not workshop_id:
            return Response({"error": "Workshop ID is required"}, status=400)
        
        vehicles = self.service.get_vehicles_by_workshop(int(workshop_id))
        serializer = self.serializer_class(vehicles, many=True)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Get vehicles by owner",
        description="Retrieve vehicles owned by a specific user",
        parameters=[OpenApiParameter(name="owner", location=OpenApiParameter.QUERY, description="Owner ID", required=True, type=int)],
        responses={200: VehicleSerializer(many=True)}
    )
    @action(detail=False, methods=['get'])
    def by_owner(self, request):
        """
        Pobiera pojazdy należące do określonego właściciela.
        """
        owner_id = request.query_params.get("owner")
        if not owner_id:
            return Response({"error": "Owner ID is required"}, status=400)
        
        vehicles = self.service.get_vehicles_by_client(int(owner_id))
        serializer = self.serializer_class(vehicles, many=True)
        return Response(serializer.data)