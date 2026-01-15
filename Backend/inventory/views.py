from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from forecasting.models import Forecast
from .models import InventoryLevel, StockMovement
from .serializers import InventoryLevelSerializer, StockMovementSerializer

class InventoryLevelViewSet(viewsets.ModelViewSet):
    queryset = InventoryLevel.objects.all()
    serializer_class = InventoryLevelSerializer
    permission_classes = [IsAuthenticated]


@action(detail=False, methods=['get'])
def low_stock_alert(self, request):
    """Get products below minimum stock level"""
    low_stock = InventoryLevel.objects.filter(
        current_stock__lte=models.F('minimum_stock_level')
    )
    serializer = self.get_serializer(low_stock, many=True)
    return Response(serializer.data)

@action(detail=False, methods=['post'])
def optimize(self, request):
    """Optimize inventory levels based on forecasts"""
    from datetime import timedelta
    from django.utils import timezone
    
    optimizations = []
    
    for inventory in InventoryLevel.objects.all():
        # Get latest forecast for product
        latest_forecast = Forecast.objects.filter(
            product=inventory.product,
            status='completed'
        ).order_by('-forecast_date').first()
        
        if not latest_forecast:
            continue
        
        # Calculate reorder quantities
        lead_time = inventory.product.lead_time_days
        daily_demand = latest_forecast.predicted_demand
        
        # Safety stock = Z-score * std_dev * sqrt(lead_time)
        # Simplified: use upper confidence interval
        safety_stock = max(int(latest_forecast.confidence_interval_upper), int(daily_demand * 2))
        
        # Minimum stock = (daily_demand * lead_time) + safety_stock
        minimum_stock = int(daily_demand * lead_time) + safety_stock
        
        # Maximum stock = minimum_stock + (reorder_quantity * 2)
        reorder_quantity = int(daily_demand * 30)  # 30 days of demand
        maximum_stock = minimum_stock + (reorder_quantity * 2)
        
        # Update inventory
        inventory.safety_stock = safety_stock
        inventory.minimum_stock_level = minimum_stock
        inventory.maximum_stock_level = maximum_stock
        inventory.reorder_quantity = reorder_quantity
        inventory.save()
        
        optimizations.append({
            'product_id': str(inventory.product.id),
            'product_name': inventory.product.name,
            'new_minimum_stock': minimum_stock,
            'new_maximum_stock': maximum_stock,
            'new_safety_stock': safety_stock,
            'new_reorder_quantity': reorder_quantity,
        })
    
    return Response({
        'optimized_count': len(optimizations),
        'optimizations': optimizations,
    })
class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.all()
    serializer_class = StockMovementSerializer
    permission_classes = [IsAuthenticated]
    ordering_fields = ['created_at']