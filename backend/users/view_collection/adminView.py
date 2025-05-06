from backend.views_collection.BaseView import BaseViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status, permissions
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse
from ..services.userService import UserService
from ..serializers import UserSerializer

@extend_schema_view(
    list=extend_schema(
        summary="List all users",
        description="Returns a list of all users in the system.",
        responses={200: UserSerializer(many=True)}
    ),
    retrieve=extend_schema(
        summary="Retrieve a user by ID",
        description="Returns detailed information about a specific user.",
        responses={200: UserSerializer, 404: OpenApiResponse(description="User not found")}
    ),
    create=extend_schema(
        summary="Create a new user",
        description="Creates a new user in the system.",
        request=UserSerializer,
        responses={201: UserSerializer, 400: OpenApiResponse(description="Bad Request")}
    ),
    update=extend_schema(
        summary="Update an existing user",
        description="Updates the details of an existing user.",
        request=UserSerializer,
        responses={200: UserSerializer, 400: OpenApiResponse(description="Bad Request")}
    ),
    destroy=extend_schema(
        summary="Delete a user",
        description="Deletes a user from the system.",
        responses={204: OpenApiResponse(description="User deleted successfully"), 404: OpenApiResponse(description="User not found")}
    )
)
class AdminViewSet(BaseViewSet):
    service = UserService
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    @extend_schema(
        summary="Dashboard statistics",
        description="Returns statistics about users, such as total users, active users, and blocked users.",
        responses={200: OpenApiResponse(description="Statistics retrieved successfully")}
    )
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        stats = self.service.get_dashboard_statistics()
        return Response(stats, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Block a user",
        description="Blocks a specific user by ID.",
        responses={200: OpenApiResponse(description="User blocked successfully"), 404: OpenApiResponse(description="User not found")}
    )
    @action(detail=True, methods=['post'])
    def block_user(self, request, pk=None):
        try:
            result = self.service.block_user(pk)
            return Response(result, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Activate a user",
        description="Activates a specific user by ID.",
        responses={200: OpenApiResponse(description="User activated successfully"), 404: OpenApiResponse(description="User not found")}
    )
    @action(detail=True, methods=['post'])
    def activate_user(self, request, pk=None):
        try:
            result = self.service.activate_user(pk)
            return Response(result, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)