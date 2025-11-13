from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import ViewSet
from django.http import Http404
from datetime import datetime, date, timedelta
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from backend.views_collection.BaseView import BaseViewSet
from ..services.availabilityService import AvailabilityService
from ..services.mechanicAvailabilityService import MechanicAvailabilityService
from ..models import WorkshopAvailability, WorkshopBreak
from ..serializers import WorkshopAvailabilitySerializer, WorkshopBreakSerializer


class WorkshopAvailabilityViewSet(BaseViewSet):
    service = AvailabilityService
    serializer_class = WorkshopAvailabilitySerializer

    @extend_schema(
        summary="Check workshop availability for a specific date",
        description="Returns available time slots for a workshop on a given date",
        parameters=[
            OpenApiParameter(name="workshop_id", description="ID of the workshop", required=True, type=int),
            OpenApiParameter(name="date", description="Date in YYYY-MM-DD format", required=True, type=str)
        ],
        responses={
            200: OpenApiResponse(description="Availability information"),
            400: OpenApiResponse(description="Invalid parameters"),
            404: OpenApiResponse(description="Workshop not found")
        }
    )
    @action(detail=False, methods=['get'])
    def check_availability(self, request):
        """Check availability for a specific workshop and date"""
        workshop_id = request.query_params.get('workshop_id')
        date_str = request.query_params.get('date')
        
        if not workshop_id or not date_str:
            return Response(
                {"error": "Both 'workshop_id' and 'date' parameters are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            workshop_id = int(workshop_id)
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except (ValueError, TypeError):
            return Response(
                {"error": "Invalid workshop_id or date format (expected YYYY-MM-DD)"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            availability = self.service.get_workshop_availability(workshop_id, target_date)
            return Response(availability)
        except Exception as e:
            return Response(
                {"error": f"Error checking availability: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        summary="Get available dates for a workshop in a date range",
        description="Returns list of dates with available slots in the specified range",
        parameters=[
            OpenApiParameter(name="workshop_id", description="ID of the workshop", required=True, type=int),
            OpenApiParameter(name="start_date", description="Start date in YYYY-MM-DD format", required=True, type=str),
            OpenApiParameter(name="end_date", description="End date in YYYY-MM-DD format", required=True, type=str)
        ],
        responses={
            200: OpenApiResponse(description="List of available dates"),
            400: OpenApiResponse(description="Invalid parameters"),
            404: OpenApiResponse(description="Workshop not found")
        }
    )
    @action(detail=False, methods=['get'])
    def available_dates(self, request):
        """Get available dates in a date range"""
        workshop_id = request.query_params.get('workshop_id')
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        
        if not all([workshop_id, start_date_str, end_date_str]):
            return Response(
                {"error": "Parameters 'workshop_id', 'start_date', and 'end_date' are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            workshop_id = int(workshop_id)
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            
            if start_date > end_date:
                return Response(
                    {"error": "Start date cannot be after end date"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            # Ograniczenie do 30 dni
            if (end_date - start_date).days > 30:
                return Response(
                    {"error": "Date range cannot exceed 30 days"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except (ValueError, TypeError):
            return Response(
                {"error": "Invalid parameters format"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            available_dates = self.service.get_available_dates(workshop_id, start_date, end_date)
            return Response({"available_dates": available_dates})
        except Exception as e:
            return Response(
                {"error": f"Error fetching available dates: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        summary="Check if a specific time slot is available",
        description="Verify if a specific date and time slot is available for booking",
        parameters=[
            OpenApiParameter(name="workshop_id", description="ID of the workshop", required=True, type=int),
            OpenApiParameter(name="datetime", description="DateTime in ISO format", required=True, type=str)
        ],
        responses={
            200: OpenApiResponse(description="Slot availability status"),
            400: OpenApiResponse(description="Invalid parameters"),
            404: OpenApiResponse(description="Workshop not found")
        }
    )
    @action(detail=False, methods=['get'])
    def check_slot(self, request):
        """Check if a specific time slot is available"""
        workshop_id = request.query_params.get('workshop_id')
        datetime_str = request.query_params.get('datetime')
        
        if not workshop_id or not datetime_str:
            return Response(
                {"error": "Both 'workshop_id' and 'datetime' parameters are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            workshop_id = int(workshop_id)
            datetime_slot = datetime.fromisoformat(datetime_str.replace('Z', '+00:00'))
        except (ValueError, TypeError):
            return Response(
                {"error": "Invalid workshop_id or datetime format"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            is_available = self.service.check_slot_availability(workshop_id, datetime_slot)
            return Response({
                "available": is_available,
                "workshop_id": workshop_id,
                "datetime": datetime_slot.isoformat()
            })
        except Exception as e:
            return Response(
                {"error": f"Error checking slot availability: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        summary="Create default availability schedule for workshop",
        description="Creates a default Monday-Friday 8:00-17:00, Saturday 8:00-15:00 schedule",
        parameters=[
            OpenApiParameter(name="workshop_id", description="ID of the workshop", required=True, type=int)
        ],
        responses={
            200: OpenApiResponse(description="Schedule created successfully"),
            400: OpenApiResponse(description="Invalid parameters"),
            404: OpenApiResponse(description="Workshop not found")
        }
    )
    @action(detail=False, methods=['post'])
    def create_default_schedule(self, request):
        """Create default availability schedule for a workshop"""
        workshop_id = request.query_params.get('workshop_id')
        
        if not workshop_id:
            return Response(
                {"error": "Parameter 'workshop_id' is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            workshop_id = int(workshop_id)
            self.service.create_default_availability(workshop_id)
            return Response({"message": "Default schedule created successfully"})
        except Exception as e:
            return Response(
                {"error": f"Error creating default schedule: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class WorkshopBreakViewSet(BaseViewSet):
    queryset = WorkshopBreak.objects.all()
    serializer_class = WorkshopBreakSerializer

    @extend_schema(
        summary="Get workshop breaks for a specific workshop",
        description="Returns all breaks (holidays, maintenance) for a workshop",
        parameters=[
            OpenApiParameter(name="workshop_id", description="ID of the workshop", required=True, type=int)
        ],
        responses={200: WorkshopBreakSerializer(many=True)}
    )
    @action(detail=False, methods=['get'])
    def by_workshop(self, request):
        """Get all breaks for a specific workshop"""
        workshop_id = request.query_params.get('workshop_id')
        
        if not workshop_id:
            return Response(
                {"error": "Parameter 'workshop_id' is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            workshop_id = int(workshop_id)
            breaks = WorkshopBreak.objects.filter(workshop_id=workshop_id)
            serializer = self.serializer_class(breaks, many=True)
            return Response(serializer.data)
        except ValueError:
            return Response(
                {"error": "Invalid workshop_id"},
                status=status.HTTP_400_BAD_REQUEST
            )


class MechanicAvailabilityViewSet(ViewSet):
    """Separate ViewSet for mechanic availability endpoints"""
    
    @extend_schema(
        summary="Check mechanic availability for workshop",
        description="Returns available mechanics for specific date and time in workshop",
        parameters=[
            OpenApiParameter(name="workshop_id", description="ID of the workshop", required=True, type=int),
            OpenApiParameter(name="date", description="Date (YYYY-MM-DD)", required=True, type=str),
            OpenApiParameter(name="time", description="Time (HH:MM)", required=False, type=str),
            OpenApiParameter(name="duration", description="Duration in minutes", required=False, type=int),
        ],
        responses={
            200: OpenApiResponse(description="Mechanic availability information"),
            400: OpenApiResponse(description="Bad request")
        }
    )
    @action(detail=False, methods=['get'], url_path='mechanic-availability')
    def check_mechanic_availability(self, request):
        """Check which mechanics are available for a specific date and time"""
        workshop_id = request.query_params.get('workshop_id')
        date_str = request.query_params.get('date')
        time_str = request.query_params.get('time')
        duration = int(request.query_params.get('duration', 120))
        
        if not workshop_id or not date_str:
            return Response(
                {"error": "Parameters 'workshop_id' and 'date' are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            workshop_id = int(workshop_id)
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            
            if time_str:
                # Sprawdź konkretny czas
                time_slot = datetime.strptime(time_str, '%H:%M').time()
                available_mechanics = MechanicAvailabilityService.get_available_mechanics(
                    workshop_id, target_date, time_slot, duration
                )
                
                mechanic_data = []
                for mechanic in available_mechanics:
                    mechanic_data.append({
                        'id': mechanic.id,
                        'first_name': mechanic.first_name,
                        'last_name': mechanic.last_name,
                        'username': mechanic.username,
                        'email': mechanic.email
                    })
                
                return Response({
                    'date': date_str,
                    'time': time_str,
                    'duration_minutes': duration,
                    'available_mechanics': mechanic_data,
                    'total_available': len(mechanic_data)
                })
            else:
                # Zwróć wszystkie dostępne sloty z mechanikami
                slots_with_mechanics = MechanicAvailabilityService.get_available_time_slots(
                    workshop_id, target_date, duration
                )
                
                formatted_slots = {}
                for time_slot, mechanics in slots_with_mechanics.items():
                    mechanic_data = []
                    for mechanic in mechanics:
                        mechanic_data.append({
                            'id': mechanic.id,
                            'first_name': mechanic.first_name,
                            'last_name': mechanic.last_name,
                            'username': mechanic.username,
                            'email': mechanic.email
                        })
                    
                    formatted_slots[time_slot.strftime('%H:%M')] = {
                        'available_mechanics': mechanic_data,
                        'total_available': len(mechanic_data)
                    }
                
                return Response({
                    'date': date_str,
                    'duration_minutes': duration,
                    'available_slots': formatted_slots
                })
                
        except ValueError as e:
            return Response(
                {"error": f"Invalid date/time format: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": f"Error checking mechanic availability: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @extend_schema(
        summary="Get all mechanics in workshop",
        description="Returns list of all mechanics working in specific workshop",
        parameters=[
            OpenApiParameter(name="workshop_id", description="ID of the workshop", required=True, type=int)
        ],
        responses={
            200: OpenApiResponse(description="List of mechanics"),
            400: OpenApiResponse(description="Bad request")
        }
    )
    @action(detail=False, methods=['get'], url_path='workshop-mechanics')  
    def get_workshop_mechanics(self, request):
        """Get all mechanics working in a specific workshop"""
        workshop_id = request.query_params.get('workshop_id')
        
        if not workshop_id:
            return Response(
                {"error": "Parameter 'workshop_id' is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            workshop_id = int(workshop_id)
            workshop_mechanics = MechanicAvailabilityService.get_workshop_mechanics(workshop_id)
            
            mechanics_data = []
            for workshop_mechanic in workshop_mechanics:
                mechanic = workshop_mechanic.mechanic
                mechanics_data.append({
                    'id': mechanic.id,
                    'first_name': mechanic.first_name,
                    'last_name': mechanic.last_name,
                    'username': mechanic.username,
                    'email': mechanic.email,
                    'hired_date': workshop_mechanic.hired_date.isoformat() if workshop_mechanic.hired_date else None
                })
            
            return Response({
                'workshop_id': workshop_id,
                'mechanics': mechanics_data,
                'total_count': len(mechanics_data)
            })
            
        except ValueError:
            return Response(
                {"error": "Invalid workshop_id"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": f"Error getting workshop mechanics: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )