from rest_framework import serializers
from .models import User, Profile, LoginHistory, LoyaltyPoints
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# Serializator profilu użytkownika
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['id','user','address', 'phone', 'preferred_contact_method']

# Serializator użytkownika
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'first_name', 'last_name', 'status', 'is_active']  # Usuwamy 'profile'

    def create(self, validated_data):
        # Tworzenie użytkownika bez profilu
        user = User.objects.create(**validated_data)
        return user

    def update(self, instance, validated_data):
        # Aktualizacja użytkownika bez profilu
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email already exists.")
        return value

class LoginHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LoginHistory
        fields = ['id', 'user', 'login_time', 'device_info', 'status']

class LoyaltyPointsSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoyaltyPoints
        fields = ['id', 'user', 'total_points', 'points_earned_this_year', 'membership_level']

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Dodajemy dodatkowe pola do tokena
        token['is_active'] = user.is_active
        token['role'] = user.groups.first().name if user.groups.exists() else "client"
        return token