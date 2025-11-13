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
from ..models import WorkshopAvailability, WorkshopBreak, MechanicAvailability
from ..serializers import WorkshopAvailabilitySerializer, WorkshopBreakSerializer


class WorkshopAvailabilityViewSet(BaseViewSet):
    service = AvailabilityService
    serializer_class = WorkshopAvailabilitySerializer

    def list(self, request):
        """Override list - redirect to specific actions"""
        return Response({
            "message": "Use specific endpoints: check_availability, available_dates, get-workshop-mechanics, get-mechanic-availability",
            "available_actions": [
                "/api/v1/availability/check_availability/",
                "/api/v1/availability/available_dates/",
                "/api/v1/availability/get-workshop-mechanics/",
                "/api/v1/availability/get-mechanic-availability/"
            ]
        })

    def retrieve(self, request, pk=None):
        """Override retrieve - redirect to specific actions"""
        return Response({
            "message": "Use specific endpoints with query parameters",
            "available_actions": [
                "/api/v1/availability/check_availability/?workshop_id=X&date=YYYY-MM-DD",
                "/api/v1/availability/get-workshop-mechanics/?workshop_id=X"
            ]
        })

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

    @extend_schema(
        summary="Get workshop mechanics",
        description="Returns list of mechanics assigned to a workshop",
        parameters=[
            OpenApiParameter(name="workshop_id", description="ID of the workshop", required=True, type=int),
        ],
        responses={
            200: OpenApiResponse(description="Workshop mechanics information"),
            400: OpenApiResponse(description="Bad request")
        }
    )
    @action(detail=False, methods=['get'], url_path='get-workshop-mechanics')
    def get_workshop_mechanics(self, request):
        """Get all mechanics for a specific workshop"""
        print(f"DEBUG: get_workshop_mechanics called with params: {request.query_params}")
        workshop_id = request.query_params.get('workshop_id')
        
        if not workshop_id:
            print("DEBUG: No workshop_id provided")
            return Response(
                {"error": "Parameter 'workshop_id' is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            workshop_id = int(workshop_id)
            print(f"DEBUG: Getting mechanics for workshop {workshop_id}")
            mechanics = MechanicAvailabilityService.get_workshop_mechanics(workshop_id)
            print(f"DEBUG: Found {mechanics.count()} mechanics")
            
            mechanic_data = []
            for mechanic in mechanics:
                mechanic_data.append({
                    'id': mechanic.mechanic.id,
                    'first_name': mechanic.mechanic.first_name,
                    'last_name': mechanic.mechanic.last_name,
                    'full_name': f"{mechanic.mechanic.first_name} {mechanic.mechanic.last_name}",
                    'email': mechanic.mechanic.email
                })
            
            return Response({
                'mechanics': mechanic_data,
                'total_count': len(mechanic_data)
            })
            
        except ValueError as e:
            print(f"DEBUG: ValueError: {e}")
            return Response(
                {"error": "Invalid workshop_id"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print(f"DEBUG: Exception in get_workshop_mechanics: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()
            return Response(
                {"error": f"Error retrieving mechanics: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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
    @action(detail=False, methods=['get'], url_path='get-mechanic-availability')
    def check_mechanic_availability(self, request):
        """Check which mechanics are available for a specific date and time"""
        print(f"DEBUG: check_mechanic_availability called with params: {request.query_params}")
        workshop_id = request.query_params.get('workshop_id')
        date_str = request.query_params.get('date')
        time_str = request.query_params.get('time')
        
        try:
            duration = int(request.query_params.get('duration', 60))
            print(f"DEBUG: workshop_id={workshop_id}, date_str={date_str}, time_str={time_str}, duration={duration}")
        except Exception as e:
            print(f"DEBUG: Error parsing duration: {e}")
            duration = 120
        
        if not workshop_id or not date_str:
            print("DEBUG: Missing required params")
            return Response(
                {"error": "Parameters 'workshop_id' and 'date' are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            workshop_id = int(workshop_id)
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            print(f"DEBUG: Parsed workshop_id={workshop_id}, target_date={target_date}")
            
            if time_str:
                print(f"DEBUG: Checking specific time {time_str}")
                # Sprawdź konkretny czas
                time_slot = datetime.strptime(time_str, '%H:%M').time()
                print(f"DEBUG: Parsed time_slot={time_slot}")
                
                available_mechanics = MechanicAvailabilityService.get_available_mechanics(
                    workshop_id, target_date, time_slot, duration
                )
                print(f"DEBUG: Available mechanics count: {len(available_mechanics)}")
                
                mechanic_data = []
                for mechanic in available_mechanics:
                    mechanic_data.append({
                        'id': mechanic.id,
                        'first_name': mechanic.first_name,
                        'last_name': mechanic.last_name,
                        'full_name': f"{mechanic.first_name} {mechanic.last_name}",
                        'email': mechanic.email,
                        'is_available': True
                    })
                
                # Pobierz wszystkich mechaników warsztatu dla porównania
                print("DEBUG: Getting all workshop mechanics for comparison")
                all_mechanics = MechanicAvailabilityService.get_workshop_mechanics(workshop_id)
                
                # Utwórz set ID dostępnych mechaników dla szybkiego wyszukiwania
                available_mechanic_ids = {mechanic.id for mechanic in available_mechanics}
                
                # Dodaj niedostępnych mechaników
                for workshop_mechanic in all_mechanics:
                    if workshop_mechanic.mechanic.id not in available_mechanic_ids:
                        mechanic_data.append({
                            'id': workshop_mechanic.mechanic.id,
                            'first_name': workshop_mechanic.mechanic.first_name,
                            'last_name': workshop_mechanic.mechanic.last_name,
                            'full_name': f"{workshop_mechanic.mechanic.first_name} {workshop_mechanic.mechanic.last_name}",
                            'email': workshop_mechanic.mechanic.email,
                            'is_available': False
                        })
                
                print(f"DEBUG: Unavailable mechanics count: {len(all_mechanics) - len(available_mechanics)}")
                print(f"DEBUG: Returning {len(mechanic_data)} total mechanics")
                return Response({
                    'mechanics': mechanic_data,
                    'available_count': len(available_mechanics),
                    'total_count': len(all_mechanics),
                    'date': date_str,
                    'time': time_str
                })
            else:
                # Sprawdź ogólną dostępność na cały dzień
                print("DEBUG: Checking general availability for the day")
                all_mechanics = MechanicAvailabilityService.get_workshop_mechanics(workshop_id)
                mechanic_data = []
                
                for mechanic in all_mechanics:
                    # Sprawdź czy mechanik ma dostępność w tym dniu
                    weekday = target_date.weekday()
                    try:
                        availability = MechanicAvailability.objects.get(
                            workshop_mechanic=mechanic,
                            weekday=weekday
                        )
                        is_available = availability.is_available
                    except MechanicAvailability.DoesNotExist:
                        is_available = False
                    mechanic_data.append({
                        'id': mechanic.mechanic.id,
                        'first_name': mechanic.mechanic.first_name,
                        'last_name': mechanic.mechanic.last_name,
                        'full_name': f"{mechanic.mechanic.first_name} {mechanic.mechanic.last_name}",
                        'email': mechanic.mechanic.email,
                        'is_available': is_available
                    })
                
                available_count = sum(1 for m in mechanic_data if m['is_available'])
                
                return Response({
                    'mechanics': mechanic_data,
                    'available_count': available_count,
                    'total_count': len(all_mechanics),
                    'date': date_str
                })
                
        except ValueError as e:
            print(f"DEBUG: ValueError in check_mechanic_availability: {e}")
            return Response(
                {"error": f"Invalid parameter: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print(f"DEBUG: Exception in check_mechanic_availability: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()
            return Response(
                {"error": f"Error checking availability: {str(e)}"},
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