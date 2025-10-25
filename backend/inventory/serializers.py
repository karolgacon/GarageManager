from rest_framework import serializers
from .models import Part, RepairJobPart, StockEntry, Supplier

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'

class PartSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    
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
