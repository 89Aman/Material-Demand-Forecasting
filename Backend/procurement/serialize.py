from rest_framework import serializers
from .models import Supplier, ProcurementOrder

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = 'all'

class ProcurementOrderSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)

    class Meta:
        model = ProcurementOrder
        fields = ['id', 'product', 'product_name', 'supplier', 'supplier_name', 'quantity', 
                'unit_cost', 'total_cost', 'order_date', 'expected_delivery_date', 
                'actual_delivery_date', 'status', 'forecast_id', 'created_at']
