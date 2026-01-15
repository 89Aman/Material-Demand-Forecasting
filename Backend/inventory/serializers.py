from rest_framework import serializers
from .models import InventoryLevel, StockMovement

class InventoryLevelSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    stock_out_risk = serializers.CharField(read_only=True)
    class Meta:
        model = InventoryLevel
        fields = ['id', 'product', 'product_name', 'current_stock', 'minimum_stock_level', 
                'maximum_stock_level', 'safety_stock', 'reorder_quantity', 'holding_cost_per_unit', 
                'stock_out_risk']
        
class StockMovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockMovement
        fields = ['id', 'inventory', 'movement_type', 'quantity', 'reference_id', 'notes', 'created_at']