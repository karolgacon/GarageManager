from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from ..models import CustomerFeedback
from ..serializers import CustomerFeedbackSerializer


class CustomerFeedbackViewSet(viewsets.ViewSet):
    """
    ViewSet dla zarządzania opiniami klientów (CustomerFeedback).
    Pozwala na tworzenie, przeglądanie, aktualizację i usuwanie opinii.
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CustomerFeedback.objects.all()

    @extend_schema(
        summary="Lista wszystkich opinii klientów",
        description="Pobiera listę wszystkich opinii klientów w systemie.",
        responses={200: CustomerFeedbackSerializer(many=True)},
        examples=[
            OpenApiExample(
                'Przykładowa odpowiedź',
                value=[
                    {
                        "id": 1,
                        "client": 3,
                        "repair_job": 2,
                        "rating": 5,
                        "review_text": "Świetna obsługa i szybka naprawa telefonu!",
                        "feedback_date": "2025-03-20T15:25:30Z",
                        "service_quality": 5,
                        "punctuality_rating": 4,
                        "would_recommend": True,
                        "response_from_workshop": "Dziękujemy za pozytywną opinię!",
                        "response_date": "2025-03-21T10:15:22Z",
                        "tags": "szybka obsługa, profesjonalizm"
                    },
                    {
                        "id": 2,
                        "client": 4,
                        "repair_job": 5,
                        "rating": 4,
                        "review_text": "Dobra jakość usługi, choć cena mogłaby być niższa.",
                        "feedback_date": "2025-03-25T09:10:45Z",
                        "service_quality": 4,
                        "punctuality_rating": 5,
                        "would_recommend": True,
                        "response_from_workshop": "",
                        "response_date": "",
                        "tags": "dobra jakość, wysoka cena"
                    }
                ]
            )
        ]
    )
    def list(self, request):
        """Pobierz listę wszystkich opinii klientów."""
        queryset = self.get_queryset()
        serializer = CustomerFeedbackSerializer(queryset, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Szczegóły opinii",
        description="Pobiera szczegółowe informacje o konkretnej opinii klienta.",
        parameters=[
            OpenApiParameter(name="pk", location=OpenApiParameter.PATH, description="ID opinii", required=True,
                             type=int)
        ],
        responses={
            200: CustomerFeedbackSerializer,
            404: {"description": "Opinia nie została znaleziona"}
        },
        examples=[
            OpenApiExample(
                'Przykładowa odpowiedź',
                value={
                    "id": 1,
                    "client": 3,
                    "repair_job": 2,
                    "rating": 5,
                    "review_text": "Świetna obsługa i szybka naprawa telefonu!",
                    "feedback_date": "2025-03-20T15:25:30Z",
                    "service_quality": 5,
                    "punctuality_rating": 4,
                    "would_recommend": True,
                    "response_from_workshop": "Dziękujemy za pozytywną opinię!",
                    "response_date": "2025-03-21T10:15:22Z",
                    "tags": "szybka obsługa, profesjonalizm"
                }
            )
        ]
    )
    def retrieve(self, request, pk=None):
        """Pobierz szczegóły konkretnej opinii."""
        try:
            feedback = CustomerFeedback.objects.get(pk=pk)
            serializer = CustomerFeedbackSerializer(feedback)
            return Response(serializer.data)
        except CustomerFeedback.DoesNotExist:
            return Response(
                {"error": "Opinia nie została znaleziona"},
                status=status.HTTP_404_NOT_FOUND
            )

    @extend_schema(
        summary="Utwórz opinię",
        description="Tworzy nową opinię klienta na podstawie dostarczonych danych.",
        request=CustomerFeedbackSerializer,
        responses={
            201: CustomerFeedbackSerializer,
            400: {"description": "Niepoprawne dane"}
        },
        examples=[
            OpenApiExample(
                'Przykładowe zapytanie',
                value={
                    "client": 5,
                    "repair_job": 8,
                    "rating": 5,
                    "review_text": "Bardzo profesjonalna obsługa i fachowa pomoc. Polecam!",
                    "service_quality": 5,
                    "punctuality_rating": 4,
                    "would_recommend": True,
                    "tags": "profesjonalizm, szybka obsługa"
                },
                request_only=True
            ),
            OpenApiExample(
                'Przykładowa odpowiedź',
                value={
                    "id": 3,
                    "client": 5,
                    "repair_job": 8,
                    "rating": 5,
                    "review_text": "Bardzo profesjonalna obsługa i fachowa pomoc. Polecam!",
                    "feedback_date": "2025-04-08T20:15:30Z",
                    "service_quality": 5,
                    "punctuality_rating": 4,
                    "would_recommend": True,
                    "response_from_workshop": "",
                    "response_date": "",
                    "tags": "profesjonalizm, szybka obsługa"
                },
                response_only=True
            )
        ]
    )
    def create(self, request):
        """Utwórz nową opinię klienta."""
        serializer = CustomerFeedbackSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Aktualizuj opinię",
        description="Aktualizuje całą opinię klienta na podstawie dostarczonych danych.",
        parameters=[
            OpenApiParameter(name="pk", location=OpenApiParameter.PATH, description="ID opinii", required=True,
                             type=int)
        ],
        request=CustomerFeedbackSerializer,
        responses={
            200: CustomerFeedbackSerializer,
            400: {"description": "Niepoprawne dane"},
            404: {"description": "Opinia nie została znaleziona"}
        },
        examples=[
            OpenApiExample(
                'Przykładowe zapytanie',
                value={
                    "client": 5,
                    "repair_job": 8,
                    "rating": 4,
                    "review_text": "Profesjonalna obsługa, choć trochę długi czas oczekiwania.",
                    "service_quality": 4,
                    "punctuality_rating": 3,
                    "would_recommend": True,
                    "tags": "profesjonalizm, długi czas oczekiwania"
                },
                request_only=True
            ),
            OpenApiExample(
                'Przykładowa odpowiedź',
                value={
                    "id": 3,
                    "client": 5,
                    "repair_job": 8,
                    "rating": 4,
                    "review_text": "Profesjonalna obsługa, choć trochę długi czas oczekiwania.",
                    "feedback_date": "2025-04-08T20:15:30Z",
                    "service_quality": 4,
                    "punctuality_rating": 3,
                    "would_recommend": True,
                    "response_from_workshop": "",
                    "response_date": "",
                    "tags": "profesjonalizm, długi czas oczekiwania"
                },
                response_only=True
            )
        ]
    )
    def update(self, request, pk=None):
        """Aktualizuj całą opinię."""
        try:
            feedback = CustomerFeedback.objects.get(pk=pk)
            serializer = CustomerFeedbackSerializer(feedback, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except CustomerFeedback.DoesNotExist:
            return Response(
                {"error": "Opinia nie została znaleziona"},
                status=status.HTTP_404_NOT_FOUND
            )

    @extend_schema(
        summary="Częściowa aktualizacja opinii",
        description="Aktualizuje wybrane pola opinii klienta.",
        parameters=[
            OpenApiParameter(name="pk", location=OpenApiParameter.PATH, description="ID opinii", required=True,
                             type=int)
        ],
        request=CustomerFeedbackSerializer,
        responses={
            200: CustomerFeedbackSerializer,
            400: {"description": "Niepoprawne dane"},
            404: {"description": "Opinia nie została znaleziona"}
        },
        examples=[
            OpenApiExample(
                'Przykładowe zapytanie',
                value={
                    "review_text": "Profesjonalna obsługa, choć trochę długi czas oczekiwania. Mimo to polecam.",
                    "tags": "profesjonalizm, długi czas oczekiwania, polecam"
                },
                request_only=True
            ),
            OpenApiExample(
                'Przykładowa odpowiedź',
                value={
                    "id": 3,
                    "client": 5,
                    "repair_job": 8,
                    "rating": 4,
                    "review_text": "Profesjonalna obsługa, choć trochę długi czas oczekiwania. Mimo to polecam.",
                    "feedback_date": "2025-04-08T20:15:30Z",
                    "service_quality": 4,
                    "punctuality_rating": 3,
                    "would_recommend": True,
                    "response_from_workshop": "",
                    "response_date": "",
                    "tags": "profesjonalizm, długi czas oczekiwania, polecam"
                },
                response_only=True
            )
        ]
    )
    def partial_update(self, request, pk=None):
        """Aktualizuj częściowo opinię."""
        try:
            feedback = CustomerFeedback.objects.get(pk=pk)
            serializer = CustomerFeedbackSerializer(feedback, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except CustomerFeedback.DoesNotExist:
            return Response(
                {"error": "Opinia nie została znaleziona"},
                status=status.HTTP_404_NOT_FOUND
            )

    @extend_schema(
        summary="Usuń opinię",
        description="Usuwa określoną opinię klienta z systemu.",
        parameters=[
            OpenApiParameter(name="pk", location=OpenApiParameter.PATH, description="ID opinii", required=True,
                             type=int)
        ],
        responses={
            204: {"description": "Opinia została usunięta"},
            404: {"description": "Opinia nie została znaleziona"}
        }
    )
    def destroy(self, request, pk=None):
        """Usuń opinię."""
        try:
            feedback = CustomerFeedback.objects.get(pk=pk)
            feedback.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CustomerFeedback.DoesNotExist:
            return Response(
                {"error": "Opinia nie została znaleziona"},
                status=status.HTTP_404_NOT_FOUND
            )

    @extend_schema(
        summary="Opinie według oceny",
        description="Filtruje opinie według minimalnej oceny.",
        parameters=[
            OpenApiParameter(name="min_rating", location=OpenApiParameter.QUERY, description="Minimalna ocena (1-5)",
                             required=True, type=int)
        ],
        responses={200: CustomerFeedbackSerializer(many=True)},
        examples=[
            OpenApiExample(
                'Przykładowa odpowiedź dla min_rating=4',
                value=[
                    {
                        "id": 1,
                        "client": 3,
                        "repair_job": 2,
                        "rating": 5,
                        "review_text": "Świetna obsługa i szybka naprawa telefonu!",
                        "feedback_date": "2025-03-20T15:25:30Z",
                        "service_quality": 5,
                        "punctuality_rating": 4,
                        "would_recommend": True,
                        "response_from_workshop": "Dziękujemy za pozytywną opinię!",
                        "response_date": "2025-03-21T10:15:22Z",
                        "tags": "szybka obsługa, profesjonalizm"
                    },
                    {
                        "id": 2,
                        "client": 4,
                        "repair_job": 5,
                        "rating": 4,
                        "review_text": "Dobra jakość usługi, choć cena mogłaby być niższa.",
                        "feedback_date": "2025-03-25T09:10:45Z",
                        "service_quality": 4,
                        "punctuality_rating": 5,
                        "would_recommend": True,
                        "response_from_workshop": "",
                        "response_date": "",
                        "tags": "dobra jakość, wysoka cena"
                    }
                ]
            )
        ]
    )
    @action(detail=False, methods=['get'])
    def by_rating(self, request):
        """Pobierz opinie z określoną minimalną oceną."""
        min_rating = request.query_params.get('min_rating')
        if min_rating and min_rating.isdigit():
            feedbacks = self.get_queryset().filter(rating__gte=int(min_rating))
            serializer = CustomerFeedbackSerializer(feedbacks, many=True)
            return Response(serializer.data)
        return Response(
            {"error": "Wymagany parametr min_rating (liczba całkowita)"},
            status=status.HTTP_400_BAD_REQUEST
        )

    @extend_schema(
        summary="Odpowiedź warsztatu",
        description="Dodaje odpowiedź warsztatu do opinii klienta.",
        parameters=[
            OpenApiParameter(name="pk", location=OpenApiParameter.PATH, description="ID opinii", required=True,
                             type=int)
        ],
        request={
            "application/json": {
                "schema": {
                    "type": "object",
                    "properties": {
                        "response_from_workshop": {"type": "string"}
                    },
                    "required": ["response_from_workshop"]
                }
            }
        },
        responses={
            200: CustomerFeedbackSerializer,
            400: {"description": "Niepoprawne dane"},
            404: {"description": "Opinia nie została znaleziona"}
        },
        examples=[
            OpenApiExample(
                'Przykładowe zapytanie',
                value={
                    "response_from_workshop": "Dziękujemy za opinię. Staramy się stale poprawiać jakość naszych usług."
                },
                request_only=True
            ),
            OpenApiExample(
                'Przykładowa odpowiedź',
                value={
                    "id": 3,
                    "client": 5,
                    "repair_job": 8,
                    "rating": 4,
                    "review_text": "Profesjonalna obsługa, choć trochę długi czas oczekiwania.",
                    "feedback_date": "2025-04-08T20:15:30Z",
                    "service_quality": 4,
                    "punctuality_rating": 3,
                    "would_recommend": True,
                    "response_from_workshop": "Dziękujemy za opinię. Staramy się stale poprawiać jakość naszych usług.",
                    "response_date": "2025-04-09T10:30:15Z",
                    "tags": "profesjonalizm, długi czas oczekiwania"
                },
                response_only=True
            )
        ]
    )
    @action(detail=True, methods=['post'])
    def add_workshop_response(self, request, pk=None):
        """Dodaj odpowiedź warsztatu do opinii klienta."""
        try:
            feedback = CustomerFeedback.objects.get(pk=pk)

            response_text = request.data.get('response_from_workshop')
            if not response_text:
                return Response(
                    {"error": "Pole response_from_workshop jest wymagane"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            from django.utils import timezone
            feedback.response_from_workshop = response_text
            feedback.response_date = timezone.now()
            feedback.save()

            serializer = CustomerFeedbackSerializer(feedback)
            return Response(serializer.data)
        except CustomerFeedback.DoesNotExist:
            return Response(
                {"error": "Opinia nie została znaleziona"},
                status=status.HTTP_404_NOT_FOUND
            )

    @extend_schema(
        summary="Opinie z rekomendacją",
        description="Pobiera listę opinii z pozytywną rekomendacją (would_recommend=True).",
        responses={200: CustomerFeedbackSerializer(many=True)},
        examples=[
            OpenApiExample(
                'Przykładowa odpowiedź',
                value=[
                    {
                        "id": 1,
                        "client": 3,
                        "repair_job": 2,
                        "rating": 5,
                        "review_text": "Świetna obsługa i szybka naprawa telefonu!",
                        "feedback_date": "2025-03-20T15:25:30Z",
                        "service_quality": 5,
                        "punctuality_rating": 4,
                        "would_recommend": True,
                        "response_from_workshop": "Dziękujemy za pozytywną opinię!",
                        "response_date": "2025-03-21T10:15:22Z",
                        "tags": "szybka obsługa, profesjonalizm"
                    }
                ]
            )
        ]
    )
    @action(detail=False, methods=['get'])
    def recommended(self, request):
        """Pobierz opinie z pozytywną rekomendacją."""
        feedbacks = self.get_queryset().filter(would_recommend=True)
        serializer = CustomerFeedbackSerializer(feedbacks, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Opinie według tagów",
        description="Filtruje opinie zawierające określony tag.",
        parameters=[
            OpenApiParameter(name="tag", location=OpenApiParameter.QUERY, description="Szukany tag", required=True,
                             type=str)
        ],
        responses={200: CustomerFeedbackSerializer(many=True)},
        examples=[
            OpenApiExample(
                'Przykładowa odpowiedź dla tag=profesjonalizm',
                value=[
                    {
                        "id": 1,
                        "client": 3,
                        "repair_job": 2,
                        "rating": 5,
                        "review_text": "Świetna obsługa i szybka naprawa telefonu!",
                        "feedback_date": "2025-03-20T15:25:30Z",
                        "service_quality": 5,
                        "punctuality_rating": 4,
                        "would_recommend": True,
                        "response_from_workshop": "Dziękujemy za pozytywną opinię!",
                        "response_date": "2025-03-21T10:15:22Z",
                        "tags": "szybka obsługa, profesjonalizm"
                    }
                ]
            )
        ]
    )
    @action(detail=False, methods=['get'])
    def by_tag(self, request):
        """Pobierz opinie zawierające określony tag."""
        tag = request.query_params.get('tag')
        if not tag:
            return Response(
                {"error": "Wymagany parametr tag"},
                status=status.HTTP_400_BAD_REQUEST
            )

        feedbacks = self.get_queryset().filter(tags__icontains=tag)
        serializer = CustomerFeedbackSerializer(feedbacks, many=True)
        return Response(serializer.data)