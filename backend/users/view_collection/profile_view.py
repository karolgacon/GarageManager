from backend.views_collection.BaseView import BaseViewSet
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse
from ..services.profileService import ProfileService
from ..serializers import ProfileSerializer

@extend_schema_view(
    create=extend_schema(
        summary="Create user profile",
        description="Create a new profile for the authenticated user",
        responses={
            201: OpenApiResponse(description="Profile created successfully"),
            400: OpenApiResponse(description="Bad request"),
            401: OpenApiResponse(description="Unauthorized"),
        }
    ),
)
class ProfileViewSet(BaseViewSet):
    service = ProfileService
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request):
        # Automatycznie przypisz zalogowanego użytkownika
        data = request.data.copy()
        data['user'] = request.user.id
        request._full_data = data
        return super().create(request)

    def get_queryset(self):
        # Tylko profil zalogowanego użytkownika
        return self.service.repository.model.objects.filter(user=self.request.user)