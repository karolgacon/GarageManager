from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from ..models import RepairJob
from ..serializers import RepairJobSerializer

class RepairJobViewSet(viewsets.ViewSet):
    """
    ViewSet dla zarządzania naprawami.
    Obsługuje operacje CRUD dla napraw.
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Zwraca wszystkie naprawy.
        """
        return RepairJob.objects.all()

    @extend_schema(
        summary="Lista wszystkich napraw",
        description="Zwraca listę wszystkich napraw.",
        responses={
            200: RepairJobSerializer(many=True),
            401: OpenApiTypes.OBJECT,
        },
        examples=[
            OpenApiExample("Przykład odpowiedzi",
                value=[
                    {
                        "id": 1,
                        "appointment": 1,
                        "mechanic": 1,
                        "description": "Wymiana oleju",
                        "cost": 100.00,
                        "duration": 60,
                        "complexity_level": "simple",
                        "warranty_period": 3,
                        "diagnostic_notes": "Brak",
                    },
                    {
                        "id": 2,
                        "appointment": 2,
                        "mechanic": 2,
                        "description": "Wymiana klocków hamulcowych",
                        "cost": 200.00,
                        "duration": 120,
                        "complexity_level": "moderate",
                        "warranty_period": 6,
                        "diagnostic_notes": "Brak",
                    }
                ]
            )
        ]
    )
    def list(self, request):
        """
        Zwraca listę wszystkich napraw.
        """
        queryset = self.get_queryset()
        serializer = RepairJobSerializer(queryset, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Szczegóły naprawy",
        description="Zwraca szczegóły naprawy o podanym ID.",
        parameters=[
            OpenApiParameter(name='pk', type=OpenApiTypes.INT, description='ID naprawy'),
        ],
        responses={
            200: RepairJobSerializer,
            404: OpenApiTypes.OBJECT,
            401: OpenApiTypes.OBJECT,
        },
        examples=[
            OpenApiExample("Przykład odpowiedzi",
                value={
                    "id": 1,
                    "appointment": 1,
                    "mechanic": 1,
                    "description": "Wymiana oleju",
                    "cost": 100.00,
                    "duration": 60,
                    "complexity_level": "simple",
                    "warranty_period": 3,
                    "diagnostic_notes": "Brak",
                }
            )
        ]
    )
    def retrieve(self, request, pk=None):
        """
        Zwraca szczegóły naprawy o podanym ID.
        """
        try:
            repair_job = self.get_queryset().get(pk=pk)
            serializer = RepairJobSerializer(repair_job)
            return Response(serializer.data)
        except RepairJob.DoesNotExist:
            return Response({"error": "Nie znaleziono naprawy."}, status=status.HTTP_404_NOT_FOUND)

    @extend_schema(
        summary="Utwórz nową naprawę",
        description="Tworzy nową naprawę.",
        request=RepairJobSerializer,
        responses={
            201: RepairJobSerializer,
            400: {"description": "Niepoprawne dane wejściowe"},
            401: {"description": "Brak autoryzacji"},
        },
        examples=[
            OpenApiExample("Przykład odpowiedzi",
                value={
                    "id": 1,
                    "appointment": 1,
                    "mechanic": 1,
                    "description": "Wymiana oleju",
                    "cost": 100.00,
                    "duration": 60,
                    "complexity_level": "simple",
                    "warranty_period": 3,
                    "diagnostic_notes": "Brak",
                }
            )
        ]
    )
    def create(self, request):
        """
        Tworzy nową naprawę.
        """
        serializer = RepairJobSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Zaktualizuj naprawę",
        description="Aktualizuje naprawę o podanym ID.",
        parameters=[
            OpenApiParameter(name='pk', type=OpenApiTypes.INT, description='ID naprawy'),
        ],
        request=RepairJobSerializer,
        responses={
            200: RepairJobSerializer,
            400: {"description": "Niepoprawne dane wejściowe"},
            404: {"description": "Nie znaleziono naprawy"},
            401: {"description": "Brak autoryzacji"},
        },
        examples=[
            OpenApiExample("Przykład odpowiedzi",
                value={
                    "id": 1,
                    "appointment": 1,
                    "mechanic": 1,
                    "description": "Wymiana oleju",
                    "cost": 100.00,
                    "duration": 60,
                    "complexity_level": "simple",
                    "warranty_period": 3,
                    "diagnostic_notes": "Brak",
                }
            )
        ]
    )
    def update(self, request, pk=None):
        """
        Aktualizuje naprawę o podanym ID.
        """
        try:
            repair_job = self.get_queryset().get(pk=pk)
            serializer = RepairJobSerializer(repair_job, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except RepairJob.DoesNotExist:
            return Response({"error": "Nie znaleziono naprawy."}, status=status.HTTP_404_NOT_FOUND)

    @extend_schema(
        summary="Częściowa aktualizacja naprawy",
        description="Częściowo aktualizuje naprawę o podanym ID.",
        parameters=[
            OpenApiParameter(name='pk', type=OpenApiTypes.INT, description='ID naprawy'),
        ],
        request=RepairJobSerializer,
        responses={
            200: RepairJobSerializer,
            400: {"description": "Niepoprawne dane wejściowe"},
            404: {"description": "Nie znaleziono naprawy"},
            401: {"description": "Brak autoryzacji"},
        },
        examples=[
            OpenApiExample("Przykład odpowiedzi",
                value={
                    "id": 1,
                    "appointment": 1,
                    "mechanic": 1,
                    "description": "Wymiana oleju",
                    "cost": 100.00,
                    "duration": 60,
                    "complexity_level": "simple",
                    "warranty_period": 3,
                    "diagnostic_notes": "Brak",
                }
            )
        ]
    )
    def partial_update(self, request, pk=None):
        """
        Częściowo aktualizuje naprawę o podanym ID.
        """
        try:
            repair_job = self.get_queryset().get(pk=pk)
            serializer = RepairJobSerializer(repair_job, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except RepairJob.DoesNotExist:
            return Response({"error": "Nie znaleziono naprawy."}, status=status.HTTP_404_NOT_FOUND)
    @extend_schema(
        summary="Usuń naprawę",
        description="Usuwa naprawę o podanym ID.",
        parameters=[
            OpenApiParameter(name='pk', type=OpenApiTypes.INT, description='ID naprawy'),
        ],
        responses={
            204: {"description": "Naprawa usunięta pomyślnie"},
            404: {"description": "Nie znaleziono naprawy"},
            401: {"description": "Brak autoryzacji"},
        },
    )
    def destroy(self, request, pk=None):
        """
        Usuwa naprawę o podanym ID.
        """
        try:
            repair_job = self.get_queryset().get(pk=pk)
            repair_job.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except RepairJob.DoesNotExist:
            return Response({"error": "Nie znaleziono naprawy."}, status=status.HTTP_404_NOT_FOUND)

    @extend_schema(
        summary="Naprawy danego mechanika",
        description="Zwraca naprawy przypisane do danego mechanika.",
        parameters=[
            OpenApiParameter(name='mechanic_id', type=OpenApiTypes.INT, description='ID mechanika'),
        ],
        responses={
            200: RepairJobSerializer(many=True),
            404: {"description": "Nie znaleziono mechanika"},
            401: {"description": "Brak autoryzacji"},
        },
        examples=[
            OpenApiExample("Przykład odpowiedzi",
                value=[
                    {
                        "id": 1,
                        "appointment": 1,
                        "mechanic": 1,
                        "description": "Wymiana oleju",
                        "cost": 100.00,
                        "duration": 60,
                        "complexity_level": "simple",
                        "warranty_period": 3,
                        "diagnostic_notes": "Brak",
                    },
                    {
                        "id": 2,
                        "appointment": 2,
                        "mechanic": 1,
                        "description": "Wymiana klocków hamulcowych",
                        "cost": 200.00,
                        "duration": 120,
                        "complexity_level": "moderate",
                        "warranty_period": 6,
                        "diagnostic_notes": "Brak",
                    }
                ]
            )
        ]
    )
    @action(detail=False, methods=['get'], url_path='mechanic/(?P<mechanic_id>[^/.]+)')
    def mechanic_repairs(self, request, mechanic_id=None):
        """
        Zwraca naprawy przypisane do danego mechanika.
        """
        try:
            repairs = self.get_queryset().filter(mechanic_id=mechanic_id)
            serializer = RepairJobSerializer(repairs, many=True)
            return Response(serializer.data)
        except RepairJob.DoesNotExist:
            return Response({"error": "Nie znaleziono napraw."}, status=status.HTTP_404_NOT_FOUND)

    @extend_schema(
        summary="Naprawy do danego zlecenia",
        description="Zwraca naprawy przypisane do danego zlecenia.",
        parameters=[
            OpenApiParameter(name='appointment_id', type=OpenApiTypes.INT, description='ID zlecenia'),
        ],
        responses={
            200: RepairJobSerializer(many=True),
            404: {"description": "Nie znaleziono zlecenia"},
            401: {"description": "Brak autoryzacji"},
        },
        examples=[
            OpenApiExample("Przykład odpowiedzi",
                value=[
                    {
                        "id": 1,
                        "appointment": 1,
                        "mechanic": 1,
                        "description": "Wymiana oleju",
                        "cost": 100.00,
                        "duration": 60,
                        "complexity_level": "simple",
                        "warranty_period": 3,
                        "diagnostic_notes": "Brak",
                    },
                    {
                        "id": 2,
                        "appointment": 1,
                        "mechanic": 2,
                        "description": "Wymiana klocków hamulcowych",
                        "cost": 200.00,
                        "duration": 120,
                        "complexity_level": "moderate",
                        "warranty_period": 6,
                        "diagnostic_notes": "Brak",
                    }
                ]
            )
        ]
    )
    @action(detail=False, methods=['get'], url_path='appointment/(?P<appointment_id>[^/.]+)')
    def appointment_repairs(self, request, appointment_id=None):
        """
        Zwraca naprawy przypisane do danego zlecenia.
        """
        try:
            repairs = self.get_queryset().filter(appointment_id=appointment_id)
            serializer = RepairJobSerializer(repairs, many=True)
            return Response(serializer.data)
        except RepairJob.DoesNotExist:
            return Response({"error": "Nie znaleziono napraw."}, status=status.HTTP_404_NOT_FOUND)