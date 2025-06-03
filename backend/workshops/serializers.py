from rest_framework import serializers
from .models import Workshop, Service, WorkshopMechanic, Report
from django.contrib.auth.models import User

class WorkshopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workshop
        fields = '__all__'

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'

class  WorkshopMechanicSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkshopMechanic
        fields = '__all__'

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = '__all__'

class StaffMemberSerializer(serializers.ModelSerializer):
    hired_date = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'role', 'phone', 'hired_date', 'created_at']
    
    def get_hired_date(self, obj):
        try:
            if obj.role == 'mechanic':
                wm = WorkshopMechanic.objects.filter(mechanic=obj).first()
                if wm and wm.hired_date:
                    return wm.hired_date.isoformat()
            return obj.date_joined.date().isoformat()  # Fallback to user creation date
        except:
            return None