from rest_framework import serializers
from .models import Appointment, RepairJob, CustomerFeedback

class AppointmentSerializer(serializers.ModelSerializer):
    # Dodaj pola tylko do odczytu dla relacji
    client_name = serializers.CharField(source='client.get_full_name', read_only=True)
    workshop_name = serializers.CharField(source='workshop.name', read_only=True)
    vehicle_info = serializers.SerializerMethodField(read_only=True)
    appointment_type_display = serializers.CharField(source='get_appointment_type_display', read_only=True)
    
    # Dodatkowe pola dla kompatybilności z frontendem - tylko odczyt
    client_detail = serializers.SerializerMethodField(read_only=True)
    mechanic_detail = serializers.SerializerMethodField(read_only=True)
    vehicle_detail = serializers.SerializerMethodField(read_only=True)
    service = serializers.CharField(source='appointment_type_display', read_only=True)
    service_type = serializers.CharField(source='appointment_type_display', read_only=True)
    
    # Dodatkowe pola dla kalendarza
    customerFirstName = serializers.CharField(source='client.first_name', read_only=True)
    customerLastName = serializers.CharField(source='client.last_name', read_only=True)
    vehicleMake = serializers.CharField(source='vehicle.brand', read_only=True)
    vehicleModel = serializers.CharField(source='vehicle.model', read_only=True)
    vehicleLicensePlate = serializers.CharField(source='vehicle.registration_number', read_only=True)
    
    class Meta:
        model = Appointment
        fields = '__all__'
        
    def to_representation(self, instance):
        """Add client/mechanic/vehicle objects to response for frontend compatibility"""
        data = super().to_representation(instance)
        
        # Add expanded objects for frontend compatibility
        data['client'] = self.get_client_detail(instance)
        data['mechanic'] = self.get_mechanic_detail(instance)
        data['vehicle'] = self.get_vehicle_detail(instance)
        
        return data
    
    def get_vehicle_info(self, obj):
        if obj.vehicle:
            return f"{obj.vehicle.brand} {obj.vehicle.model} - {obj.vehicle.registration_number}"
        return None
    
    def get_client_detail(self, obj):
        if obj.client:
            return {
                'id': obj.client.id,
                'first_name': obj.client.first_name,
                'last_name': obj.client.last_name,
                'email': obj.client.email
            }
        return None
    
    def get_mechanic_detail(self, obj):
        if obj.assigned_mechanic:
            return {
                'id': obj.assigned_mechanic.id,
                'first_name': obj.assigned_mechanic.first_name,
                'last_name': obj.assigned_mechanic.last_name,
                'email': obj.assigned_mechanic.email
            }
        return None
    
    def get_vehicle_detail(self, obj):
        if obj.vehicle:
            return {
                'id': obj.vehicle.id,
                'brand': obj.vehicle.brand,
                'model': obj.vehicle.model,
                'year': obj.vehicle.year,
                'registration_number': obj.vehicle.registration_number
            }
        return None

class RepairJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = RepairJob
        fields = '__all__'

class CustomerFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerFeedback
        fields = '__all__'