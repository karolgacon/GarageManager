from rest_framework import serializers
from .models import CarWorkshop, User

class ProfileSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)  # Hasło zapisane tylko podczas tworzenia/uaktualniania
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'password']
        extra_kwargs = {'password': {'write_only': True}}  # Hasło tylko do zapisu, nie do odczytu

    def create(self, validated_data):
        password = validated_data.pop('password')  # Pobieramy hasło z danych
        user = User.objects.create_user(**validated_data)  # Tworzymy użytkownika z hasłem
        user.set_password(password)  # Ustawiamy zahaszowane hasło
        user.save()  # Zapisujemy użytkownika
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'car_workshop', 'role']

class CarWorkshopSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarWorkshop
        fields = ['nip']
