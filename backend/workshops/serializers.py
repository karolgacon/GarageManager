from rest_framework import serializers
from .models import Workshop, Service, WorkshopMechanic, Report

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