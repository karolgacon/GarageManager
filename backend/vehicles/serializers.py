from rest_framework import serializers
from .models import Vehicle,Diagnostics,MaintenanceSchedule

class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = '__all__'

class DiagnosticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diagnostics
        fields = '__all__'

class MaintenanceScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceSchedule
        fields = '__all__'