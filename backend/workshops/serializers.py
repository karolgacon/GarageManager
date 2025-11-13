from rest_framework import serializers
from .models import Workshop, Service, WorkshopMechanic, Report, WorkshopAvailability, WorkshopBreak
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
            return obj.date_joined.date().isoformat()
        except:
            return None

class WorkshopAvailabilitySerializer(serializers.ModelSerializer):
    weekday_display = serializers.CharField(source='get_weekday_display', read_only=True)
    
    class Meta:
        model = WorkshopAvailability
        fields = ['id', 'workshop', 'weekday', 'weekday_display', 'start_time', 'end_time', 
                 'is_available', 'slot_duration']

class WorkshopBreakSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkshopBreak
        fields = ['id', 'workshop', 'start_date', 'end_date', 'start_time', 'end_time', 
                 'reason', 'is_recurring']