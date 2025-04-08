from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from ..models import Appointment
from ..serializers import AppointmentSerializer


class AppointmentViewSet(viewsets.ViewSet):
    """
    ViewSet dla zarządzania wizytami (Appointments).
    Pozwala na tworzenie, przeglądanie, aktualizację i usuwanie wizyt warsztatowych.
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.all()

    @extend_schema(
        summary="Lista wszystkich wizyt",
        description="Pobiera listę wszystkich wizyt w systemie.",
        responses={200: AppointmentSerializer(many=True)},
        examples=[
            OpenApiExample(
                'Przykładowa odpowiedź',
                value=[
                    {
                        "id": 1,
                        "client": 2,
                        "workshop": 1,
                        "vehicle": 3,
                        "date": "2025-04-15T14:30:00Z",
                        "status": "confirmed",
                        "priority": "medium",
                        "estimated_completion_date": "2025-04-15T17:30:00Z",
                        "booking_type": "standard"
                    },
                    {
                        "id": 2,
                        "client": 3,
                        "workshop": 2,
                        "vehicle": 5,
                        "date": "2025-04-18T10:00:00Z",
                        "status": "pending",
                        "priority": "high",
                        "estimated_completion_date": "2025-04-18T14:00:00Z",
                        "booking_type": "urgent"
                    }
                ]
            )
        ]
    )
    def list(self, request):
        """Pobierz listę wszystkich wizyt."""
        queryset = self.get_queryset()
        serializer = AppointmentSerializer(queryset, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Szczegóły wizyty",
        description="Pobiera szczegółowe informacje o konkretnej wizycie.",
        parameters=[
            OpenApiParameter(name="pk", location=OpenApiParameter.PATH, description="ID wizyty", required=True,
                             type=int)
        ],
        responses={
            200: AppointmentSerializer,
            404: {"description": "Wizyta nie została znaleziona"}
        },
        examples=[
            OpenApiExample(
                'Przykładowa odpowiedź',
                value={
                    "id": 1,
                    "client": 2,
                    "workshop": 1,
                    "vehicle": 3,
                    "date": "2025-04-15T14:30:00Z",
                    "status": "confirmed",
                    "priority": "medium",
                    "estimated_completion_date": "2025-04-15T17:30:00Z",
                    "booking_type": "standard"
                }
            )
        ]
    )
    def retrieve(self, request, pk=None):
        """Pobierz szczegóły konkretnej wizyty."""
        try:
            appointment = Appointment.objects.get(pk=pk)
            serializer = AppointmentSerializer(appointment)
            return Response(serializer.data)
        except Appointment.DoesNotExist:
            return Response(
                {"error": "Wizyta nie została znaleziona"},
                status=status.HTTP_404_NOT_FOUND
            )

    @extend_schema(
        summary="Utwórz wizytę",
        description="Tworzy nową wizytę na podstawie dostarczonych danych.",
        request=AppointmentSerializer,
        responses={
            201: AppointmentSerializer,
            400: {"description": "Niepoprawne dane"}
        },
        examples=[
            OpenApiExample(
                'Przykładowe zapytanie',
                value={
                    "client": 2,
                    "workshop": 1,
                    "vehicle": 3,
                    "date": "2025-04-20T16:00:00Z",
                    "status": "pending",
                    "priority": "medium",
                    "estimated_completion_date": "2025-04-20T18:00:00Z",
                    "booking_type": "standard"
                },
                request_only=True
            ),
            OpenApiExample(
                'Przykładowa odpowiedź',
                value={
                    "id": 3,
                    "client": 2,
                    "workshop": 1,
                    "vehicle": 3,
                    "date": "2025-04-20T16:00:00Z",
                    "status": "pending",
                    "priority": "medium",
                    "estimated_completion_date": "2025-04-20T18:00:00Z",
                    "booking_type": "standard"
                },
                response_only=True
            )
        ]
    )
    def create(self, request):
        """Utwórz nową wizytę."""
        serializer = AppointmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Aktualizuj wizytę",
        description="Aktualizuje całą wizytę na podstawie dostarczonych danych.",
        parameters=[
            OpenApiParameter(name="pk", location=OpenApiParameter.PATH, description="ID wizyty", required=True,
                             type=int)
        ],
        request=AppointmentSerializer,
        responses={
            200: AppointmentSerializer,
            400: {"description": "Niepoprawne dane"},
            404: {"description": "Wizyta nie została znaleziona"}
        },
        examples=[
            OpenApiExample(
                'Przykładowe zapytanie',
                value={
                    "client": 2,
                    "workshop": 1,
                    "vehicle": 3,
                    "date": "2025-04-20T17:30:00Z",
                    "status": "confirmed",
                    "priority": "high",
                    "estimated_completion_date": "2025-04-20T19:30:00Z",
                    "booking_type": "standard"
                },
                request_only=True
            ),
            OpenApiExample(
                'Przykładowa odpowiedź',
                value={
                    "id": 3,
                    "client": 2,
                    "workshop": 1,
                    "vehicle": 3,
                    "date": "2025-04-20T17:30:00Z",
                    "status": "confirmed",
                    "priority": "high",
                    "estimated_completion_date": "2025-04-20T19:30:00Z",
                    "booking_type": "standard"
                },
                response_only=True
            )
        ]
    )
    def update(self, request, pk=None):
        """Aktualizuj całą wizytę."""
        try:
            appointment = Appointment.objects.get(pk=pk)
            serializer = AppointmentSerializer(appointment, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Appointment.DoesNotExist:
            return Response(
                {"error": "Wizyta nie została znaleziona"},
                status=status.HTTP_404_NOT_FOUND
            )

    @extend_schema(
        summary="Częściowa aktualizacja wizyty",
        description="Aktualizuje wybrane pola wizyty.",
        parameters=[
            OpenApiParameter(name="pk", location=OpenApiParameter.PATH, description="ID wizyty", required=True,
                             type=int)
        ],
        request=AppointmentSerializer,
        responses={
            200: AppointmentSerializer,
            400: {"description": "Niepoprawne dane"},
            404: {"description": "Wizyta nie została znaleziona"}
        },
        examples=[
            OpenApiExample(
                'Przykładowe zapytanie',
                value={
                    "status": "confirmed",
                    "priority": "high",
                    "estimated_completion_date": "2025-04-20T20:00:00Z"
                },
                request_only=True
            ),
            OpenApiExample(
                'Przykładowa odpowiedź',
                value={
                    "id": 3,
                    "client": 2,
                    "workshop": 1,
                    "vehicle": 3,
                    "date": "2025-04-20T16:00:00Z",
                    "status": "confirmed",
                    "priority": "high",
                    "estimated_completion_date": "2025-04-20T20:00:00Z",
                    "booking_type": "standard"
                },
                response_only=True
            )
        ]
    )
    def partial_update(self, request, pk=None):
        """Aktualizuj częściowo wizytę."""
        try:
            appointment = Appointment.objects.get(pk=pk)
            serializer = AppointmentSerializer(appointment, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Appointment.DoesNotExist:
            return Response(
                {"error": "Wizyta nie została znaleziona"},
                status=status.HTTP_404_NOT_FOUND
            )

    @extend_schema(
        summary="Usuń wizytę",
        description="Usuwa określoną wizytę z systemu.",
        parameters=[
            OpenApiParameter(name="pk", location=OpenApiParameter.PATH, description="ID wizyty", required=True,
                             type=int)
        ],
        responses={
            204: {"description": "Wizyta została usunięta"},
            404: {"description": "Wizyta nie została znaleziona"}
        }
    )
    def destroy(self, request, pk=None):
        """Usuń wizytę."""
        try:
            appointment = Appointment.objects.get(pk=pk)
            appointment.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Appointment.DoesNotExist:
            return Response(
                {"error": "Wizyta nie została znaleziona"},
                status=status.HTTP_404_NOT_FOUND
            )

    @extend_schema(
        summary="Wizyty danego klienta",
        description="Zwraca wszystkie wizyty przypisane do określonego klienta.",
        parameters=[
            OpenApiParameter(name="client_id", location=OpenApiParameter.QUERY, description="ID klienta",
                             required=True, type=int)
        ],
        responses={200: AppointmentSerializer(many=True)},
        examples=[
            OpenApiExample(
                'Przykładowa odpowiedź',
                value=[
                    {
                        "id": 1,
                        "client": 2,
                        "workshop": 1,
                        "vehicle": 3,
                        "date": "2025-04-15T14:30:00Z",
                        "status": "confirmed",
                        "priority": "medium",
                        "estimated_completion_date": "2025-04-15T17:30:00Z",
                        "booking_type": "standard"
                    },
                    {
                        "id": 3,
                        "client": 2,
                        "workshop": 2,
                        "vehicle": 4,
                        "date": "2025-04-20T16:00:00Z",
                        "status": "pending",
                        "priority": "high",
                        "estimated_completion_date": "2025-04-20T19:00:00Z",
                        "booking_type": "urgent"
                    }
                ]
            )
        ]
    )
    @action(detail=False, methods=['get'])
    def by_client(self, request):
        """Pobierz wizyty dla konkretnego klienta."""
        client_id = request.query_params.get('client_id')
        if client_id:
            appointments = self.get_queryset().filter(client_id=client_id)
            serializer = AppointmentSerializer(appointments, many=True)
            return Response(serializer.data)
        return Response(
            {"error": "Wymagany parametr client_id"},
            status=status.HTTP_400_BAD_REQUEST
        )

    @extend_schema(
        summary="Wizyty w danym warsztacie",
        description="Zwraca wszystkie wizyty przypisane do określonego warsztatu.",
        parameters=[
            OpenApiParameter(name="workshop_id", location=OpenApiParameter.QUERY, description="ID warsztatu",
                             required=True, type=int)
        ],
        responses={200: AppointmentSerializer(many=True)},
        examples=[
            OpenApiExample(
                'Przykładowa odpowiedź',
                value=[
                    {
                        "id": 1,
                        "client": 2,
                        "workshop": 1,
                        "vehicle": 3,
                        "date": "2025-04-15T14:30:00Z",
                        "status": "confirmed",
                        "priority": "medium",
                        "estimated_completion_date": "2025-04-15T17:30:00Z",
                        "booking_type": "standard"
                    },
                    {
                        "id": 4,
                        "client": 5,
                        "workshop": 1,
                        "vehicle": 7,
                        "date": "2025-04-22T11:00:00Z",
                        "status": "pending",
                        "priority": "low",
                        "estimated_completion_date": "2025-04-22T14:00:00Z",
                        "booking_type": "standard"
                    }
                ]
            )
        ]
    )
    @action(detail=False, methods=['get'])
    def by_workshop(self, request):
        """Pobierz wizyty dla konkretnego warsztatu."""
        workshop_id = request.query_params.get('workshop_id')
        if workshop_id:
            appointments = self.get_queryset().filter(workshop_id=workshop_id)
            serializer = AppointmentSerializer(appointments, many=True)
            return Response(serializer.data)
        return Response(
            {"error": "Wymagany parametr workshop_id"},
            status=status.HTTP_400_BAD_REQUEST
        )

    @extend_schema(
        summary="Wizyty dla danego pojazdu",
        description="Zwraca wszystkie wizyty przypisane do określonego pojazdu.",
        parameters=[
            OpenApiParameter(name="vehicle_id", location=OpenApiParameter.QUERY, description="ID pojazdu",
                             required=True, type=int)
        ],
        responses={200: AppointmentSerializer(many=True)},
        examples=[
            OpenApiExample(
                'Przykładowa odpowiedź',
                value=[
                    {
                        "id": 1,
                        "client": 2,
                        "workshop": 1,
                        "vehicle": 3,
                        "date": "2025-04-15T14:30:00Z",
                        "status": "confirmed",
                        "priority": "medium",
                        "estimated_completion_date": "2025-04-15T17:30:00Z",
                        "booking_type": "standard"
                    },
                    {
                        "id": 6,
                        "client": 2,
                        "workshop": 3,
                        "vehicle": 3,
                        "date": "2025-05-10T09:00:00Z",
                        "status": "pending",
                        "priority": "medium",
                        "estimated_completion_date": "2025-05-10T12:00:00Z",
                        "booking_type": "standard"
                    }
                ]
            )
        ]
    )
    @action(detail=False, methods=['get'])
    def by_vehicle(self, request):
        """Pobierz wizyty dla konkretnego pojazdu."""
        vehicle_id = request.query_params.get('vehicle_id')
        if vehicle_id:
            appointments = self.get_queryset().filter(vehicle_id=vehicle_id)
            serializer = AppointmentSerializer(appointments, many=True)
            return Response(serializer.data)
        return Response(
            {"error": "Wymagany parametr vehicle_id"},
            status=status.HTTP_400_BAD_REQUEST
        )

    @extend_schema(
        summary="Wizyty o określonym statusie",
        description="Zwraca wszystkie wizyty o określonym statusie.",
        parameters=[
            OpenApiParameter(name="status", location=OpenApiParameter.QUERY, description="Status wizyty", required=True,
                             type=str, enum=['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'])
        ],
        responses={200: AppointmentSerializer(many=True)},
        examples=[
            OpenApiExample(
                'Przykładowa odpowiedź',
                value=[
                    {
                        "id": 1,
                        "client": 2,
                        "workshop": 1,
                        "vehicle": 3,
                        "date": "2025-04-15T14:30:00Z",
                        "status": "confirmed",
                        "priority": "medium",
                        "estimated_completion_date": "2025-04-15T17:30:00Z",
                        "booking_type": "standard"
                    },
                    {
                        "id": 5,
                        "client": 7,
                        "workshop": 2,
                        "vehicle": 9,
                        "date": "2025-04-19T13:00:00Z",
                        "status": "confirmed",
                        "priority": "high",
                        "estimated_completion_date": "2025-04-19T16:30:00Z",
                        "booking_type": "standard"
                    }
                ]
            )
        ]
    )
    @action(detail=False, methods=['get'])
    def by_status(self, request):
        """Pobierz wizyty o określonym statusie."""
        status_value = request.query_params.get('status')
        if status_value:
            appointments = self.get_queryset().filter(status=status_value)
            serializer = AppointmentSerializer(appointments, many=True)
            return Response(serializer.data)
        return Response(
            {"error": "Wymagany parametr status"},
            status=status.HTTP_400_BAD_REQUEST
        )

    @extend_schema(
        summary="Wizyty o określonym priorytecie",
        description="Zwraca wszystkie wizyty o określonym priorytecie.",
        parameters=[
            OpenApiParameter(name="priority", location=OpenApiParameter.QUERY, description="Priorytet wizyty", required=True,
                             type=str, enum=['low', 'medium', 'high', 'urgent'])
        ],
        responses={200: AppointmentSerializer(many=True)},
        examples=[
            OpenApiExample(
                'Przykładowa odpowiedź',
                value=[
                    {
                        "id": 2,
                        "client": 3,
                        "workshop": 2,
                        "vehicle": 5,
                        "date": "2025-04-18T10:00:00Z",
                        "status": "pending",
                        "priority": "high",
                        "estimated_completion_date": "2025-04-18T14:00:00Z",
                        "booking_type": "urgent"
                    },
                    {
                        "id": 5,
                        "client": 7,
                        "workshop": 2,
                        "vehicle": 9,
                        "date": "2025-04-19T13:00:00Z",
                        "status": "confirmed",
                        "priority": "high",
                        "estimated_completion_date": "2025-04-19T16:30:00Z",
                        "booking_type": "standard"
                    }
                ]
            )
        ]
    )
    @action(detail=False, methods=['get'])
    def by_priority(self, request):
        """Pobierz wizyty o określonym priorytecie."""
        priority_value = request.query_params.get('priority')
        if priority_value:
            appointments = self.get_queryset().filter(priority=priority_value)
            serializer = AppointmentSerializer(appointments, many=True)
            return Response(serializer.data)
        return Response(
            {"error": "Wymagany parametr priority"},
            status=status.HTTP_400_BAD_REQUEST
        )