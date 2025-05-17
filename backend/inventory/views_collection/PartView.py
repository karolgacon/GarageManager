from rest_framework.decorators import action
from rest_framework.response import Response
from backend.views_collection.BaseView import BaseViewSet
from ..services.partService import PartService
from ..serializers import PartSerializer
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample

class PartViewSet(BaseViewSet):
    service = PartService
    serializer_class = PartSerializer

    @extend_schema(
        description="Create a new part in inventory",
        request=PartSerializer,
        responses={201: PartSerializer},
        examples=[
            OpenApiExample(
                'Valid Part Example',
                value={
                    'name': 'Brake Pad',
                    'manufacturer': 'Bosch',
                    'price': 49.99,
                    'stock_quantity': 10,
                    'minimum_stock_level': 5,
                    'category': 'brake',
                    'supplier': 'auto parts inc'
                },
                request_only=True
            )
        ]
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    @extend_schema(
        description="List all parts in inventory",
        responses={200: PartSerializer(many=True)}
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @extend_schema(
        description="Retrieve a specific part by ID",
        responses={200: PartSerializer}
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    @extend_schema(
        description="Update a part",
        request=PartSerializer,
        responses={200: PartSerializer}
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
    
    @extend_schema(
        description="Delete a part",
        responses={204: None}
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)