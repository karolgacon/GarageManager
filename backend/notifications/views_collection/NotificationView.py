from ..services.notificationService import NotificationService
from ..serializers import NotificationSerializer
from backend.views_collection.BaseView import BaseViewSet
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from django.db.models import Q

class NotificationViewSet(BaseViewSet):
    service = NotificationService
    serializer_class = NotificationSerializer

    def list(self, request):
        """List notifications for the authenticated user with optional filtering."""
        # Get query parameters for filtering
        channel = request.query_params.get('channel', None)
        read_status = request.query_params.get('read_status', None)
        notification_type = request.query_params.get('notification_type', None)

        # Start with notifications for the current user
        queryset = self.service.repository.model.objects.filter(user=request.user)

        # Apply filters based on query parameters
        if channel:
            queryset = queryset.filter(channel=channel)
        
        if read_status is not None:
            # Convert string to boolean
            read_status_bool = read_status.lower() in ['true', '1', 'yes']
            queryset = queryset.filter(read_status=read_status_bool)
        
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)

        # Order by creation date (newest first)
        queryset = queryset.order_by('-created_at')

        # Serialize and return the data
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark a specific notification as read."""
        try:
            notification = self.service.repository.model.objects.get(
                id=pk, 
                user=request.user
            )
            notification.read_status = True
            notification.save()
            
            serializer = self.serializer_class(notification)
            return Response(serializer.data)
        except self.service.repository.model.DoesNotExist:
            return Response(
                {"error": "Notification not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Mark all notifications as read for the current user."""
        channel = request.data.get('channel', None)
        
        # Filter notifications by user
        queryset = self.service.repository.model.objects.filter(
            user=request.user, 
            read_status=False
        )
        
        # Apply channel filter if provided
        if channel:
            queryset = queryset.filter(channel=channel)
        
        # Update all matching notifications
        updated_count = queryset.update(read_status=True)
        
        return Response({
            "message": f"Marked {updated_count} notifications as read",
            "updated_count": updated_count
        })
