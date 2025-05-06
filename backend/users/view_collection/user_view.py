from backend.views_collection.BaseView import BaseViewSet
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse
from ..services.userService import UserService
from ..serializers import UserSerializer, ProfileSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

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
class UserViewSet(BaseViewSet):
    service = UserService
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        summary="Get current user profile",
        description="Returns the profile information of the currently authenticated user.",
        responses={200: ProfileSerializer, 404: OpenApiResponse(description="User not found")}
    )
    @action(detail=False, methods=['get'])
    def profile(self, request):
        user = self.service.get_by_id(request.user.id)
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProfileSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Update current user profile",
        description="Updates the profile information of the currently authenticated user.",
        request=UserSerializer,
        responses={200: UserSerializer, 400: OpenApiResponse(description="Bad Request")}
    )
    @action(detail=False, methods=['put'])
    def update_profile(self, request):
        user = self.service.get_by_id(request.user.id)
        serializer = UserSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)