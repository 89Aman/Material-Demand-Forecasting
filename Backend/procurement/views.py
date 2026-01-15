from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
from forecasting.models import Forecast
from inventory.models import InventoryLevel
from .models import Supplier, ProcurementOrder
from .serializers import SupplierSerializer, ProcurementOrderSerializer

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated]

class ProcurementOrderViewSet(viewsets.ModelViewSet):
    queryset = ProcurementOrder.objects.all()
    serializer_class = ProcurementOrderSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['product__name', 'supplier__name', 'status']
    ordering_fields = ['order_date', 'expected_delivery_date', 'status']


    @action(detail=False, methods=['post'])
    def auto_create_from_forecast(self, request):
        """Automatically create procurement orders based on forecasts"""
        from decimal import Decimal
        
        created_orders = []
        
        # Get forecasts that suggest restocking
        forecasts = Forecast.objects.filter(
            status='completed',
            forecast_date=timezone.now().date()
        )
        
        for forecast in forecasts:
            inventory = InventoryLevel.objects.get(product=forecast.product)
            
            # Check if reordering is needed
            projected_stock = inventory.current_stock - forecast.predicted_demand
            
            if projected_stock <= inventory.minimum_stock_level:
                # Create order
                supplier = Supplier.objects.first()  # Use first supplier (should be filtered by product)
                if not supplier:
                    continue
                
                quantity = inventory.reorder_quantity
                unit_cost = Decimal(str(forecast.product.current_price))
                expected_delivery = timezone.now().date() + timedelta(days=supplier.average_lead_time_days)
                
                order = ProcurementOrder.objects.create(
                    product=forecast.product,
                    supplier=supplier,
                    quantity=quantity,
                    unit_cost=unit_cost,
                    expected_delivery_date=expected_delivery,
                    status='pending',
                    forecast_id=str(forecast.id),
                )
                
                created_orders.append(order.id)
        
        return Response({
            'created_orders': [str(oid) for oid in created_orders],
            'total_created': len(created_orders),
        }, status=status.HTTP_201_CREATED)