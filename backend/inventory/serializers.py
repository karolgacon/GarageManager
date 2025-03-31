from rest_framework import serializers
from .models import Part,RepairJobPart, StockEntry

class PartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Part
        fields = '__all__'

class RepairJobPartSerializer(serializers.ModelSerializer):
    class Meta:
        model = RepairJobPart
        fields = '__all__'

class StockEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = StockEntry
        fields = '__all__'
