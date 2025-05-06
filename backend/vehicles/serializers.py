from rest_framework import serializers
from .models import Vehicle,Diagnostics,MaintenanceSchedule

class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = '__all__'

    def validate_brand(self, value):
        """
        Validate that the brand is one of the allowed choices.
        """
        allowed_brands = [choice[0] for choice in Vehicle.BRAND_CHOICES]
        if value not in allowed_brands:
            raise serializers.ValidationError(f"'{value}' is not a valid brand. Allowed brands are: {', '.join(allowed_brands)}.")
        return value

class DiagnosticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diagnostics
        fields = '__all__'

class MaintenanceScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceSchedule
        fields = '__all__'