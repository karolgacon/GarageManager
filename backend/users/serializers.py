from rest_framework.serializers import ModelSerializer

from .models import CarWorkshop, User

class ProfileSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email']

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'car_workshop', 'role']

class CarWorkshopSerializer(ModelSerializer):
    class Meta:
        model = CarWorkshop
        fields = ['nip']