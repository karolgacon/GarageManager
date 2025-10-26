from rest_framework import serializers
from .models import User, Profile, LoginHistory, LoyaltyPoints
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['id','user','address', 'phone', 'preferred_contact_method']

class UserSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'roles', 'first_name', 'last_name', 'status', 'is_active']

    def get_roles(self, obj):
        """Return role as array for frontend compatibility"""
        return [obj.role] if obj.role else ['client']

    def create(self, validated_data):
        user = User.objects.create(**validated_data)
        return user

    def update(self, instance, validated_data):
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

        token['is_active'] = user.is_active
        token['role'] = user.role if user.role else "client"
        return token