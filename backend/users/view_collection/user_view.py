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
        summary="Get or create current user profile",
        description="Gets the profile or creates/updates it based on HTTP method.",
        request=ProfileSerializer,
        responses={
            200: ProfileSerializer, 
            201: ProfileSerializer,
            400: OpenApiResponse(description="Bad Request"),
            404: OpenApiResponse(description="User not found"),
            409: OpenApiResponse(description="Profile already exists")
        }
    )
    
    @action(detail=False, methods=['get', 'post', 'put', 'delete'])
    def profile(self, request):
        user = self.service.get_by_id(request.user.id)
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if request.method == 'GET':
            # Pobierz profil
            try:
                if hasattr(user, 'profile') and user.profile:
                    serializer = ProfileSerializer(user.profile)
                    return Response(serializer.data, status=status.HTTP_200_OK)
                else:
                    # Zamiast 404, zwróć pusty profil z kodem 200
                    return Response({
                        "id": None,
                        "user": user.id,
                        "address": "",
                        "phone": "",
                        "photo": "",
                        "preferred_contact_method": "email"
                    }, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({
                    "id": None,
                    "user": user.id,
                    "address": "",
                    "phone": "",
                    "photo": "",
                    "preferred_contact_method": "email"
                }, status=status.HTTP_200_OK)
        
        elif request.method == 'POST':
            # Utwórz profil
            if hasattr(user, 'profile') and user.profile:
                return Response(
                    {"error": "Profile already exists. Use PUT to update."}, 
                    status=status.HTTP_409_CONFLICT
                )
            
            data = request.data.copy()
            data['user'] = request.user.id
            
            serializer = ProfileSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        elif request.method == 'PUT':
            # Aktualizuj profil
            if not hasattr(user, 'profile') or not user.profile:
                # Jeśli profil nie istnieje, utwórz go
                data = request.data.copy()
                data['user'] = request.user.id
                
                serializer = ProfileSerializer(data=data)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            serializer = ProfileSerializer(user.profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        elif request.method == 'DELETE':
            # Usuń profil
            if hasattr(user, 'profile') and user.profile:
                user.profile.delete()
                return Response({"message": "Profile deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
            else:
                return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)