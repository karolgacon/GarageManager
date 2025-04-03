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
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete']

    def get_object(self):
        """ Pobieramy profil powiązany z aktualnym użytkownikiem """
        return get_object_or_404(Profile, user=self.request.user)

    def create(self, request):
        """ Tworzymy profil powiązany z aktualnym użytkownikiem """
        if hasattr(request.user, 'profile'):
            return Response({"detail": "Profile already exists."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        """ Pobiera profil użytkownika po ID, jeśli podano, inaczej pobiera profil zalogowanego użytkownika """
        if pk is None or pk == str(request.user.id):
            profile = self.get_object()  # Pobieramy profil zalogowanego użytkownika
        else:
            profile = get_object_or_404(Profile, user_id=pk)  # Pobieramy profil innego użytkownika

        serializer = self.get_serializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        """ Aktualizujemy profil powiązany z aktualnym użytkownikiem """
        profile = self.get_object()
        serializer = self.get_serializer(profile, data=request.data, partial=request.method == 'PATCH')
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        """ Usuwamy profil powiązany z aktualnym użytkownikiem """
        profile = self.get_object()
        profile.delete()
        return Response({"message": "Profile deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
