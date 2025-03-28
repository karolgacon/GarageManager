from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.viewsets import ModelViewSet
from rest_framework import status
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiResponse
from django.shortcuts import get_object_or_404
from ..models import Profile
from ..serializers import ProfileSerializer

class ProfileAPIView(ModelViewSet):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]  # Wszyscy muszą być zalogowani

    def get_queryset(self):
        """ Admin widzi wszystkie profile, a zwykły użytkownik tylko swój. """
        if self.request.user.is_staff:
            return Profile.objects.all()
        return Profile.objects.filter(user=self.request.user)

    @extend_schema(
        description="Create a new profile (user creates own, admin can create for others).",
        request=ProfileSerializer,
        responses={
            201: ProfileSerializer,
            400: OpenApiResponse(description="Bad Request")
        }
    )
    def create(self, request, *args, **kwargs):
        """
        Użytkownik może utworzyć **tylko swój profil**.
        Admin może stworzyć **profil dla dowolnego użytkownika**.
        """
        if request.user.is_staff:
            # Admin może tworzyć profil dla innych
            serializer = self.get_serializer(data=request.data)
        else:
            # Zwykły użytkownik może stworzyć profil tylko dla siebie
            data = request.data.copy()
            data["user"] = request.user.id  # Przypisanie użytkownika
            serializer = self.get_serializer(data=data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        description="Retrieve a profile by ID (admin) or own profile (user).",
        responses={200: ProfileSerializer, 404: OpenApiResponse(description="Profile not found")}
    )
    def retrieve(self, request, pk=None):
        """ Admin może pobrać dowolny profil, użytkownik tylko swój własny. """
        if request.user.is_staff:
            profile = get_object_or_404(Profile, pk=pk)
        else:
            profile = get_object_or_404(Profile, user=request.user)

        serializer = self.get_serializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        description="Update a profile (user updates own, admin updates any).",
        request=ProfileSerializer,
        responses={200: ProfileSerializer, 400: OpenApiResponse(description="Bad Request")}
    )
    def update(self, request, pk=None):
        """ Użytkownik aktualizuje tylko swój profil, admin dowolny. """
        if request.user.is_staff:
            profile = get_object_or_404(Profile, pk=pk)
        else:
            profile = get_object_or_404(Profile, user=request.user)

        serializer = self.serializer_class(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        description="Partially update a profile (user updates own, admin updates any).",
        request=ProfileSerializer,
        responses={200: ProfileSerializer, 400: OpenApiResponse(description="Bad Request")}
    )
    def partial_update(self, request, pk=None):
        """ Użytkownik może częściowo edytować swój profil, admin dowolny. """
        if request.user.is_staff:
            profile = get_object_or_404(Profile, pk=pk)
        else:
            profile = get_object_or_404(Profile, user=request.user)

        serializer = self.serializer_class(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        description="Delete a profile (admin can delete any, user deletes own).",
        responses={204: OpenApiResponse(description="Profile deleted"), 404: OpenApiResponse(description="Profile not found")}
    )
    def destroy(self, request, pk=None):
        """ Admin może usuwać dowolne profile, użytkownik tylko swój. """
        if request.user.is_staff:
            profile = get_object_or_404(Profile, pk=pk)
        else:
            profile = get_object_or_404(Profile, user=request.user)

        profile.delete()
        return Response({"message": "Profile deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
