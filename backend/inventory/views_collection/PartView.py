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
        # Extract workshop_id from the request data
        workshop_id = request.data.pop('workshop_id', None)
        
        if not workshop_id:
            return Response(
                {"error": "workshop_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Create the part first
        response = super().create(request, *args, **kwargs)
        
        if response.status_code == status.HTTP_201_CREATED:
            try:
                # Get the newly created part
                part_id = response.data['id']
                
                # Create the workshop association
                PartInventory.objects.create(
                    part_id=part_id,
                    workshop_id=workshop_id,
                    quantity=request.data.get('stock_quantity', 0)
                )
                
                # Add workshop_id to response data for the frontend
                response.data['workshop_id'] = workshop_id
            except Exception as e:
                # If there's an error creating the association, delete the part
                self.service.delete(part_id)
                return Response(
                    {"error": f"Failed to associate part with workshop: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
        return response
    
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
        # Check if workshop filter is applied
        workshop_id = request.query_params.get('workshop_id')
        
        # Check if user is admin
        is_admin = request.user.is_staff or request.user.is_superuser
        
        # Get user's workshop if they are owner/mechanic
        user_workshop_id = None
        if hasattr(request.user, 'workshop'):
            user_workshop_id = request.user.workshop.id
        
        # Get base queryset
        queryset = self.service.repository.model.objects.all()
        
        # Apply filters based on role and parameters
        if workshop_id:
            # If a specific workshop ID is requested, filter for it
            # (typically for admin users selecting a specific workshop)
            part_ids = PartInventory.objects.filter(
                workshop_id=workshop_id
            ).values_list('part_id', flat=True)
            queryset = queryset.filter(id__in=part_ids)
        elif not is_admin and user_workshop_id:
            # Non-admin users only see parts from their own workshop
            part_ids = PartInventory.objects.filter(
                workshop_id=user_workshop_id
            ).values_list('part_id', flat=True)
            queryset = queryset.filter(id__in=part_ids)
        
        serializer = self.get_serializer(queryset, many=True)
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