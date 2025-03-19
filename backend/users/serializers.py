from rest_framework import serializers
from .models import User, Profile

# Serializator profilu użytkownika
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['id','user','address', 'phone', 'photo']

# Serializator użytkownika
class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()  # Dodajemy profile jako zagnieżdżony serializator

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'profile']  # Dodajemy 'profile'

    def create(self, validated_data):
        profile_data = validated_data.pop('profile')  # Pobieramy dane profilu
        user = User.objects.create(**validated_data)
        Profile.objects.create(user=user, **profile_data)  # Tworzymy profil powiązany z użytkownikiem
        return user
