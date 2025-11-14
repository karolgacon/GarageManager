from backend.views_collection.BaseView import BaseViewSet
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse
from ..services.userService import UserService
from ..serializers import UserSerializer, ProfileSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from ..permissions import IsRootUser

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

    def get_permissions(self):
        """
        Override permissions for different actions
        """
        if self.action in ['list', 'create', 'update', 'destroy']:
            # Only root users can perform CRUD operations on all users
            permission_classes = [IsRootUser]
        else:
            # Other actions (like profile) use default permissions
            permission_classes = [IsAuthenticated]
        
        return [permission() for permission in permission_classes]

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
            try:
                # Return combined User + Profile data
                profile_data = {
                    # User data
                    'user_id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name or "",
                    'last_name': user.last_name or "",
                }
                
                print(f"DEBUG: User email: '{user.email}', Profile data: {profile_data}")
                
                # Profile data
                if hasattr(user, 'profile') and user.profile:
                    profile_data.update({
                        "id": user.profile.id,
                        "address": user.profile.address or "",
                        "phone": user.profile.phone or "",
                        "photo": user.profile.photo.url if user.profile.photo else "",
                        "preferred_contact_method": user.profile.preferred_contact_method or "email"
                    })
                else:
                    profile_data.update({
                        "id": None,
                        "address": "",
                        "phone": "",
                        "photo": "",
                        "preferred_contact_method": "email"
                    })
                    
                # Email should always be available regardless of profile existence
                return Response(profile_data, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({
                    "error": f"Error fetching profile: {str(e)}"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        elif request.method == 'POST':
            # Update User data (first_name, last_name)
            user_updated = False
            if 'first_name' in request.data:
                user.first_name = request.data['first_name']
                user_updated = True
            if 'last_name' in request.data:
                user.last_name = request.data['last_name']
                user_updated = True
                
            if user_updated:
                user.save()

            # Handle Profile data
            if hasattr(user, 'profile') and user.profile:
                return Response(
                    {"error": "Profile already exists. Use PUT to update."},
                    status=status.HTTP_409_CONFLICT
                )

            # Create profile with Profile-specific fields only
            profile_data = {
                'user': request.user.id,
                'address': request.data.get('address', ''),
                'phone': request.data.get('phone', ''),
                'preferred_contact_method': request.data.get('preferred_contact_method', 'email')
            }

            serializer = ProfileSerializer(data=profile_data)
            if serializer.is_valid():
                profile = serializer.save()
                
                # Return complete profile data
                response_data = {
                    'user_id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'id': profile.id,
                    'address': profile.address,
                    'phone': profile.phone,
                    'preferred_contact_method': profile.preferred_contact_method
                }
                return Response(response_data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        elif request.method == 'PUT':
            # Update User data (first_name, last_name)
            user_updated = False
            if 'first_name' in request.data:
                user.first_name = request.data['first_name']
                user_updated = True
            if 'last_name' in request.data:
                user.last_name = request.data['last_name']
                user_updated = True
                
            if user_updated:
                user.save()

            # Handle Profile data
            if not hasattr(user, 'profile') or not user.profile:
                # Create new profile if doesn't exist
                profile_data = {
                    'user': request.user.id,
                    'address': request.data.get('address', ''),
                    'phone': request.data.get('phone', ''),
                    'preferred_contact_method': request.data.get('preferred_contact_method', 'email')
                }

                serializer = ProfileSerializer(data=profile_data)
                if serializer.is_valid():
                    profile = serializer.save()
                    
                    response_data = {
                        'user_id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'id': profile.id,
                        'address': profile.address,
                        'phone': profile.phone,
                        'preferred_contact_method': profile.preferred_contact_method
                    }
                    return Response(response_data, status=status.HTTP_201_CREATED)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            # Update existing profile
            profile_data = {
                'address': request.data.get('address', user.profile.address),
                'phone': request.data.get('phone', user.profile.phone),
                'preferred_contact_method': request.data.get('preferred_contact_method', user.profile.preferred_contact_method)
            }
            
            serializer = ProfileSerializer(user.profile, data=profile_data, partial=True)
            if serializer.is_valid():
                profile = serializer.save()
                
                response_data = {
                    'user_id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'id': profile.id,
                    'address': profile.address,
                    'phone': profile.phone,
                    'preferred_contact_method': profile.preferred_contact_method
                }
                return Response(response_data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        elif request.method == 'DELETE':

            if hasattr(user, 'profile') and user.profile:
                user.profile.delete()
                return Response({"message": "Profile deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
            else:
                return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)