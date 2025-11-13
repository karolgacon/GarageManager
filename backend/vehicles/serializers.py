from rest_framework import serializers
from .models import Vehicle, Diagnostics, MaintenanceSchedule, VehicleService
from users.models import User
from workshops.models import Workshop, Service

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

class VehicleServiceSerializer(serializers.ModelSerializer):
    """
    Serializer for VehicleService model.
    Includes detailed information about the vehicle and service.
    """
    vehicle_details = serializers.SerializerMethodField()
    service_name = serializers.SerializerMethodField()
    workshop_name = serializers.SerializerMethodField()

    class Meta:
        model = VehicleService
        fields = [
            'id', 'vehicle', 'service', 'workshop', 'service_date',
            'completion_date', 'status', 'cost', 'description',
            'mechanic_notes', 'vehicle_details', 'service_name',
            'workshop_name'
        ]

    def get_vehicle_details(self, obj):
        """
        Returns a dictionary containing vehicle details.
        """
        if not obj.vehicle:
            return None

        return {
            'id': obj.vehicle.id,
            'make': obj.vehicle.brand,
            'model': obj.vehicle.model,
            'year': obj.vehicle.year,
            'registration_number': obj.vehicle.registration_number,
            'color': obj.vehicle.color
        }

    def get_service_name(self, obj):
        """
        Returns the name of the service.
        """
        return obj.service.name if obj.service else None

    def get_workshop_name(self, obj):
        """
        Returns the name of the workshop.
        """
        return obj.workshop.name if obj.workshop else None

    def to_representation(self, instance):
        """
        Custom representation to provide required fields for frontend compatibility.
        """
        data = super().to_representation(instance)

        data['name'] = self.get_service_name(instance)

        return data

class VehicleInServiceSerializer(serializers.ModelSerializer):
    """
    Serializer for vehicles that are currently in service.
    Includes information about current workshop and mechanic.
    """
    owner_name = serializers.SerializerMethodField()
    current_workshop_id = serializers.SerializerMethodField()
    current_workshop_name = serializers.SerializerMethodField()
    current_mechanic_id = serializers.SerializerMethodField()
    current_mechanic_name = serializers.SerializerMethodField()
    appointment_status = serializers.SerializerMethodField()

    class Meta:
        model = Vehicle
        fields = [
            'id', 'brand', 'model', 'year', 'registration_number', 'vin',
            'color', 'owner_id', 'owner_name', 'status',
            'current_workshop_id', 'current_workshop_name',
            'current_mechanic_id', 'current_mechanic_name',
            'appointment_status'
        ]

    def get_owner_name(self, obj):
        return f"{obj.owner.first_name} {obj.owner.last_name}" if obj.owner else None

    def get_current_workshop_id(self, obj):
        return getattr(obj, 'current_workshop_id', None)

    def get_current_workshop_name(self, obj):
        return getattr(obj, 'current_workshop_name', None)

    def get_current_mechanic_id(self, obj):
        return getattr(obj, 'current_mechanic_id', None)

    def get_current_mechanic_name(self, obj):
        return getattr(obj, 'current_mechanic_name', None)

    def get_appointment_status(self, obj):
        current_appointment = getattr(obj, 'current_appointment', None)
        return current_appointment.status if current_appointment else None

    def create(self, validated_data):
        """
        Override create to handle foreign key relationships.
        """
        request = self.context.get('request')
        if request:

            vehicle_id = request.data.get('vehicle_id')
            service_id = request.data.get('service_id')
            workshop_id = request.data.get('workshop_id')

            if vehicle_id and 'vehicle' not in validated_data:
                validated_data['vehicle'] = Vehicle.objects.get(id=vehicle_id)

            if service_id and 'service' not in validated_data:
                validated_data['service'] = Service.objects.get(id=service_id)

            if workshop_id and 'workshop' not in validated_data:
                validated_data['workshop'] = Workshop.objects.get(id=workshop_id)

        return super().create(validated_data)