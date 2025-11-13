from rest_framework import serializers
from .models import Appointment, RepairJob, CustomerFeedback

class AppointmentSerializer(serializers.ModelSerializer):
    # Dodaj pola tylko do odczytu dla relacji
    client_name = serializers.CharField(source='client.get_full_name', read_only=True)
    workshop_name = serializers.CharField(source='workshop.name', read_only=True)
    vehicle_info = serializers.SerializerMethodField(read_only=True)
    appointment_type_display = serializers.CharField(source='get_appointment_type_display', read_only=True)
    
    class Meta:
        model = Appointment
        fields = '__all__'
    
    def get_vehicle_info(self, obj):
        if obj.vehicle:
            return f"{obj.vehicle.brand} {obj.vehicle.model} - {obj.vehicle.registration_number}"
        return None

class RepairJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = RepairJob
        fields = '__all__'

class CustomerFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerFeedback
        fields = '__all__'