from rest_framework import serializers
from .models import User, Profile, LoginHistory, LoyaltyPoints

# Serializator profilu użytkownika
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['id','user','address', 'phone', 'photo', 'preferred_contact_method']

# Serializator użytkownika
class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()  # Dodajemy profile jako zagnieżdżony serializator

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'profile', 'first_name', 'last_name', 'status']  # Dodajemy 'profile'

    def create(self, validated_data):
        profile_data = validated_data.pop('profile')  # Pobieramy dane profilu
        user = User.objects.create(**validated_data)
        Profile.objects.create(user=user, **profile_data)  # Tworzymy profil powiązany z użytkownikiem
        return user

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