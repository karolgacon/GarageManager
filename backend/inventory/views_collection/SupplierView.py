from backend.views_collection.BaseView import BaseViewSet
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiResponse
from ..services.supplierService import SupplierService
from ..serializers import SupplierSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

@extend_schema_view(
    list=extend_schema(
        summary="List all suppliers",
        description="Retrieve a list of all suppliers in the system.",
        responses={200: SupplierSerializer(many=True)}
    ),
    retrieve=extend_schema(
        summary="Retrieve supplier details",
        description="Retrieve detailed information about a specific supplier.",
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, description="Supplier ID", required=True, type=int)],
        responses={200: SupplierSerializer, 404: OpenApiResponse(description="Supplier not found")}
    ),
    create=extend_schema(
        summary="Create a new supplier",
        description="Create a new supplier entry in the system.",
        request=SupplierSerializer,
        responses={201: SupplierSerializer, 400: OpenApiResponse(description="Invalid data")}
    ),
    destroy=extend_schema(
        summary="Delete a supplier",
        description="Delete a specific supplier by ID.",
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, description="Supplier ID", required=True, type=int)],
        responses={204: OpenApiResponse(description="No content"), 404: OpenApiResponse(description="Supplier not found")}
    ),
    update=extend_schema(
        summary="Update a supplier",
        description="Update a specific supplier by ID.",
        request=SupplierSerializer,
        responses={200: SupplierSerializer, 404: OpenApiResponse(description="Supplier not found")}
    ),
    partial_update=extend_schema(
        summary="Partially update a supplier",
        description="Partially update a specific supplier by ID.",
        request=SupplierSerializer,
        responses={200: SupplierSerializer, 404: OpenApiResponse(description="Supplier not found")}
    )
)
class SupplierViewSet(BaseViewSet):
    service = SupplierService
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Get supplier parts",
        description="Retrieve all parts provided by this supplier.",
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, description="Supplier ID", required=True, type=int)],
        responses={200: OpenApiResponse(description="List of parts from this supplier")}
    )
    @action(detail=True, methods=['get'], url_path='parts')
    def supplier_parts(self, request, pk=None):
        """
        Pobiera wszystkie części dostępne od określonego dostawcy.
        """
        try:
            supplier_id = int(pk)
            parts = self.service.get_supplier_parts(supplier_id)
            from ..serializers import PartSerializer
            serializer = PartSerializer(parts, many=True)
            return Response(serializer.data)
        except ValueError:
            return Response({"error": "Invalid supplier ID"}, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    @extend_schema(
        summary="Get active suppliers",
        description="Retrieve only active suppliers.",
        responses={200: SupplierSerializer(many=True)}
    )
    @action(detail=False, methods=['get'], url_path='active')
    def active_suppliers(self, request):
        """
        Pobiera tylko aktywnych dostawców.
        """
        try:
            suppliers = self.service.get_active_suppliers()
            serializer = self.serializer_class(suppliers, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    @extend_schema(
        summary="Search suppliers",
        description="Search suppliers by name or contact information.",
        parameters=[
            OpenApiParameter(name="q", location=OpenApiParameter.QUERY, description="Search query", required=True, type=str)
        ],
        responses={200: SupplierSerializer(many=True)}
    )
    @action(detail=False, methods=['get'], url_path='search')
    def search_suppliers(self, request):
        """
        Wyszukaj dostawców po nazwie lub danych kontaktowych.
        """
        try:
            query = request.GET.get('q', '')
            if not query:
                return Response({"error": "Search query is required"}, status=400)
            
            suppliers = self.service.search_suppliers(query)
            serializer = self.serializer_class(suppliers, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=500)