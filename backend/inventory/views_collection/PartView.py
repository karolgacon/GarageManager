from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from backend.views_collection.BaseView import BaseViewSet
from ..services.partService import PartService
from ..serializers import PartSerializer
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from ..models import PartInventory
from django.db import transaction

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
                    'supplier': 'auto parts inc',
                    'workshop_id': 1
                },
                request_only=True
            )
        ]
    )
    def create(self, request, *args, **kwargs):
        # Extract workshop_id from request data
        workshop_id = request.data.get('workshop_id')

        if not workshop_id:
            return Response(
                {"error": "workshop_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create a copy of data without workshop_id for serializer
        part_data = {k: v for k, v in request.data.items() if k != 'workshop_id'}
        
        # Use serializer for validation
        serializer = self.serializer_class(data=part_data)
        if not serializer.is_valid():
            return Response(
                {"error": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Create part using validated data
            part = self.service.create(serializer.validated_data)
            
            # Create inventory record
            PartInventory.objects.create(
                part=part,
                workshop_id=workshop_id,
                quantity=part_data.get('stock_quantity', 0)
            )

            # Return response with part data and workshop_id
            output_serializer = self.serializer_class(part)
            response_data = output_serializer.data
            response_data['workshop_id'] = workshop_id
            
            return Response(response_data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {"error": f"Failed to create part: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        description="List all parts in inventory",
        responses={200: PartSerializer(many=True)},
        parameters=[
            OpenApiParameter(
                name="workshop_id",
                description="Filter parts by workshop ID",
                required=False,
                type=int
            ),
        ]
    )
    def list(self, request, *args, **kwargs):

        workshop_id = request.query_params.get('workshop_id')

        is_admin = request.user.is_staff or request.user.is_superuser

        user_workshop_id = None
        if hasattr(request.user, 'workshop'):
            user_workshop_id = request.user.workshop.id

        queryset = self.service.repository.model.objects.all()

        if workshop_id:

            part_ids = PartInventory.objects.filter(
                workshop_id=workshop_id
            ).values_list('part_id', flat=True)
            queryset = queryset.filter(id__in=part_ids)
        elif not is_admin and user_workshop_id:

            part_ids = PartInventory.objects.filter(
                workshop_id=user_workshop_id
            ).values_list('part_id', flat=True)
            queryset = queryset.filter(id__in=part_ids)

        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

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