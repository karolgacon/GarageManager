from backend.views_collection.BaseView import BaseViewSet
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiResponse
from ..services.workshopService import WorkshopService
from ..serializers import WorkshopSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from users.serializers import UserSerializer

User = get_user_model()

@extend_schema_view(
    list=extend_schema(
        summary="List all workshops",
        description="Retrieve a list of all workshops in the system.",
        responses={200: WorkshopSerializer(many=True)}
    ),
    retrieve=extend_schema(
        summary="Retrieve workshop details",
        description="Retrieve detailed information about a specific workshop.",
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, description="Workshop ID", required=True, type=int)],
        responses={200: WorkshopSerializer, 404: OpenApiResponse(description="Workshop not found")}
    ),
    create=extend_schema(
        summary="Create a new workshop",
        description="Create a new workshop entry in the system.",
        request=WorkshopSerializer,
        responses={201: WorkshopSerializer, 400: OpenApiResponse(description="Invalid data")}
    ),
    destroy=extend_schema(
        summary="Delete a workshop",
        description="Delete a specific workshop by ID.",
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, description="Workshop ID", required=True, type=int)],
        responses={204: OpenApiResponse(description="No content"), 404: OpenApiResponse(description="Workshop not found")}
    ),
    update=extend_schema(
        summary="Update a workshop",
        description="Update a specific workshop by ID.",
        request=WorkshopSerializer,
        responses={200: WorkshopSerializer, 404: OpenApiResponse(description="Workshop not found")}
    ),
    partial_update=extend_schema(
        summary="Partially update a workshop",
        description="Partially update a specific workshop by ID.",
        request=WorkshopSerializer,
        responses={200: WorkshopSerializer, 404: OpenApiResponse(description="Workshop not found")}
    )
)
class WorkshopViewSet(BaseViewSet):
    service = WorkshopService
    serializer_class = WorkshopSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Get workshop customers",
        description="Retrieve all customers (clients) assigned to a specific workshop.",
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, description="Workshop ID", required=True, type=int)],
        responses={200: UserSerializer(many=True)}
    )
    @action(detail=True, methods=['get'], url_path='customers')
    def customers(self, request, pk=None):
        """
        Pobiera wszystkich klientów przypisanych do określonego warsztatu.
        """
        try:
            workshop_id = int(pk)
            customers = self.service.get_workshop_customers(workshop_id)
            serializer = UserSerializer(customers, many=True)
            return Response(serializer.data)
        except ValueError:
            return Response({"error": "Invalid workshop ID"}, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    @extend_schema(
        summary="Get current user's workshop customers",
        description="Retrieve all customers assigned to the current user's workshop.",
        responses={200: UserSerializer(many=True)}
    )
    @action(detail=False, methods=['get'], url_path='my-customers')
    def my_customers(self, request):
        """
        Pobiera wszystkich klientów przypisanych do warsztatu zalogowanego użytkownika.
        """
        try:
            user = request.user
            customers = self.service.get_user_workshop_customers(user.id)
            serializer = UserSerializer(customers, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    @extend_schema(
        summary="Get current user's workshop",
        description="Retrieve the workshop assigned to the current user.",
        responses={200: WorkshopSerializer}
    )
    @action(detail=False, methods=['get'], url_path='my-workshop')
    def my_workshop(self, request):
        """
        Pobiera warsztat przypisany do zalogowanego użytkownika.
        """
        try:
            user = request.user
            workshop = self.service.get_user_workshop(user.id)
            if not workshop:
                return Response({"error": "No workshop assigned to user"}, status=404)
            serializer = self.serializer_class(workshop)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    @extend_schema(
        summary="Get workshop staff",
        description="Retrieve all staff members (owners and mechanics) assigned to a specific workshop.",
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, description="Workshop ID", required=True, type=int)],
        responses={200: UserSerializer(many=True)}
    )
    @action(detail=True, methods=['get'], url_path='staff')
    def staff(self, request, pk=None):
        """
        Pobiera wszystkich pracowników (owner i mechanic) przypisanych do określonego warsztatu.
        """
        try:
            workshop_id = int(pk)

            try:
                staff = self.service.get_workshop_staff(workshop_id)
            except Exception as e:

                staff = self.service.get_workshop_staff_alternative(workshop_id)

            serializer = UserSerializer(staff, many=True)
            return Response(serializer.data)
        except ValueError:
            return Response({"error": "Invalid workshop ID"}, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    @extend_schema(
        summary="Get workshop mechanics only",
        description="Retrieve all mechanics assigned to a specific workshop.",
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, description="Workshop ID", required=True, type=int)],
        responses={200: UserSerializer(many=True)}
    )
    @action(detail=True, methods=['get'], url_path='mechanics')
    def mechanics(self, request, pk=None):
        """
        Pobiera wszystkich mechaników przypisanych do określonego warsztatu.
        """
        try:
            workshop_id = int(pk)
            mechanics = self.service.get_workshop_mechanics(workshop_id)
            serializer = UserSerializer(mechanics, many=True)
            return Response(serializer.data)
        except ValueError:
            return Response({"error": "Invalid workshop ID"}, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=500)