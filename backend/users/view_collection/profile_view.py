from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from rest_framework import status
from rest_framework.response import Response
from ..models import Profile
from ..serializers import ProfileSerializer
from django.shortcuts import get_object_or_404

class ProfileAPIView(ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    http_method_names = ['get', 'post', 'delete', 'put']

    def get_permissions(self):
        if self.action == 'list':
            return [IsAuthenticated()]
        return [IsAuthenticated()]

    def get_object(self):
        # Pobieramy profil powiązany z aktualnym użytkownikiem
        return get_object_or_404(Profile, user=self.request.user)

    def create(self, request):
        # Tworzymy profil powiązany z aktualnym użytkownikiem
        if hasattr(request.user, 'profile'):
            return Response({"detail": "Profile already exists."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request):
        # Zwracamy profil tylko dla zalogowanego użytkownika
        profile = get_object_or_404(Profile, user=request.user)
        serializer = self.get_serializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def update(self, request, pk=None):
        # Aktualizujemy profil powiązany z aktualnym użytkownikiem
        profile = get_object_or_404(Profile, user=request.user)
        serializer = self.serializer_class(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk=None):
        # Usuwamy profil powiązany z aktualnym użytkownikiem
        profile = get_object_or_404(Profile, user=request.user)
        profile.delete()
        return Response({"message": "Profile deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
