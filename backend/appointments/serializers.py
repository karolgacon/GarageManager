from rest_framework import serializers
from .models import Appointment, RepairJob, CustomerFeedback

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = '__all__'

class RepairJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = RepairJob
        fields = '__all__'

class CustomerFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerFeedback
        fields = '__all__'