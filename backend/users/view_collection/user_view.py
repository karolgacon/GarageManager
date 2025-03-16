from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter
from ..models import User
from ..serializers import ProfileSerializer, UserSerializer


class UserViewAPI(APIView):
    permission_classes = (AllowAny,)

    @extend_schema(
        description="Get the profile of the current authenticated user.",
        responses={200: ProfileSerializer, 404: OpenApiResponse(description="User not found")}
    )
    def get(self, request):
        """
        Get the profile information of the current authenticated user.
        """
        user = get_object_or_404(User, email=self.request.user.email)
        user_serializer = ProfileSerializer(user)
        return Response(user_serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        description="Update the profile of the current authenticated user.",
        request=UserSerializer,
        responses={200: UserSerializer, 400: OpenApiResponse(description="Bad Request")}
    )
    def put(self, request):
        """
        Update the profile of the current authenticated user.
        """
        user = get_object_or_404(User, email=self.request.user.email)
        user_serializer = UserSerializer(user, data=request.data)
        if user_serializer.is_valid():
            user_serializer.save()
            return Response(user_serializer.data, status=status.HTTP_200_OK)
        return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UsersAPIView(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (AllowAny,)

    @extend_schema(
        description="List all users in the car workshop.",
        responses={200: UserSerializer(many=True), 404: OpenApiResponse(description="Users not found")}
    )
    def list(self, request):
        """
        List all users in the current authenticated user's car workshop.
        """
        try:
            queryset = self.filter_queryset(self.get_queryset())
            users = queryset.all()
            serializer = self.get_serializer(users, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'message': "User not found"}, status=status.HTTP_404_NOT_FOUND)

    @extend_schema(
        description="Retrieve a user by ID.",
        responses={200: UserSerializer, 404: OpenApiResponse(description="User not found")}
    )
    def retrieve(self, request, pk=None):
        """
        Retrieve a user by ID.
        """
        try:
            user = self.get_object()
            serializer = self.get_serializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'message': "User not found"}, status=status.HTTP_404_NOT_FOUND)

    @extend_schema(
        description="Create a new user in the car workshop.",
        request=UserSerializer,
        responses={201: UserSerializer, 400: OpenApiResponse(description="Bad Request"), 403: OpenApiResponse(description="Forbidden")}
    )
    def create(self, request):
        """
        Create a new user in the car workshop of the authenticated user.
        """
        user = request.user
        if not hasattr(user, 'car_workshop'):
            return Response({'error': "User does not have a car workshop"}, status=status.HTTP_403_FORBIDDEN)

        user_serializer = UserSerializer(data=request.data)
        if user_serializer.is_valid():
            user_serializer.save(car_workshop=user.car_workshop)
            return Response(user_serializer.data, status=status.HTTP_201_CREATED)
        return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        description="Update an existing user in the car workshop.",
        request=UserSerializer,
        responses={200: UserSerializer, 400: OpenApiResponse(description="Bad Request")}
    )
    def update(self, request, *args, **kwargs):
        """
        Update an existing user in the car workshop.
        """
        user = self.get_object()
        request.data['car_workshop'] = self.request.user.car_workshop.id
        user_serializer = UserSerializer(user, data=request.data)

        if user_serializer.is_valid():
            user_serializer.save()
            return Response(user_serializer.data, status=status.HTTP_200_OK)
        return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        description="Delete a user by ID.",
        responses={204: OpenApiResponse(description="User deleted successfully"), 404: OpenApiResponse(description="User not found")}
    )
    def delete(self, request, pk=None):
        """
        Delete a user by ID.
        """
        try:
            user = self.get_object()
            user.delete()
            return Response({'message': "User deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({'message': "User not found"}, status=status.HTTP_404_NOT_FOUND)
