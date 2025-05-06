from backend.views_collection.BaseView import BaseViewSet
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse
from ..services.profileService import ProfileService
from ..serializers import ProfileSerializer

@extend_schema_view(
    retrieve=extend_schema(
        summary="Retrieve current user's profile",
        description="Returns the profile information of the currently authenticated user.",
        responses={200: ProfileSerializer, 404: OpenApiResponse(description="Profile not found")}
    ),
    create=extend_schema(
        summary="Create a profile",
        description="Creates a profile for the currently authenticated user.",
        request=ProfileSerializer,
        responses={201: ProfileSerializer, 400: OpenApiResponse(description="Bad Request")}
    ),
    update=extend_schema(
        summary="Update current user's profile",
        description="Updates the profile information of the currently authenticated user.",
        request=ProfileSerializer,
        responses={200: ProfileSerializer, 400: OpenApiResponse(description="Bad Request")}
    ),
    destroy=extend_schema(
        summary="Delete current user's profile",
        description="Deletes the profile of the currently authenticated user.",
        responses={204: OpenApiResponse(description="Profile deleted successfully"), 404: OpenApiResponse(description="Profile not found")}
    )
)
class ProfileViewSet(BaseViewSet):
    service = ProfileService
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def retrieve(self, request, pk=None):
        """
        Pobiera profil aktualnie zalogowanego użytkownika.
        """
        if pk is None:
            pk = request.user.id  # Ustawiamy ID zalogowanego użytkownika
        return super().retrieve(request, pk)

    def create(self, request):
        """
        Tworzy profil powiązany z aktualnym użytkownikiem.
        """
        request.data['user'] = request.user.id  # Automatycznie przypisujemy użytkownika
        return super().create(request)

    def update(self, request, pk=None):
        """
        Aktualizuje profil powiązany z aktualnym użytkownikiem.
        """
        if pk is None:
            pk = request.user.id  # Ustawiamy ID zalogowanego użytkownika
        return super().update(request, pk)

    def destroy(self, request, pk=None):
        """
        Usuwa profil powiązany z aktualnym użytkownikiem.
        """
        if pk is None:
            pk = request.user.id  # Ustawiamy ID zalogowanego użytkownika
        return super().destroy(request, pk)