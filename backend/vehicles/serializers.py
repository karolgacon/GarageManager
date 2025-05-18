from rest_framework import serializers
from .models import Vehicle,Diagnostics,MaintenanceSchedule

class VehicleSerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()
    workshop_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Vehicle
        fields = [
            'id', 'brand', 'model', 'year', 'registration_number', 'vin',
            'color', 'engine_type', 'mileage', 'fuel_type', 'transmission',
            'owner_id', 'workshop_id', 'status', 'last_service_date',
            'next_service_due', 'image_url', 'owner_name', 'workshop_name'
        ]

    def get_owner_name(self, obj):
        return obj.owner_name
    
    def get_workshop_name(self, obj):
        return obj.workshop_name

    def validate_brand(self, value):
        """
        Validate that the brand is one of the allowed choices.
        """
        allowed_brands = [choice[0] for choice in Vehicle.BRAND_CHOICES]
        if value not in allowed_brands:
            raise serializers.ValidationError(f"'{value}' is not a valid brand. Allowed brands are: {', '.join(allowed_brands)}.")
        return value

    def create(self, validated_data):
        workshop_id = self.context['request'].data.get('workshop_id')
        owner_id = self.context['request'].data.get('owner_id')
        
        # Get workshop and owner instances if present
        if workshop_id:
            workshop = Workshop.objects.get(id=workshop_id)
            validated_data['workshop'] = workshop
        
        if owner_id:
            owner = User.objects.get(id=owner_id)
            validated_data['owner'] = owner
        
        return super().create(validated_data)

class DiagnosticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diagnostics
        fields = '__all__'

class MaintenanceScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceSchedule
        fields = '__all__'