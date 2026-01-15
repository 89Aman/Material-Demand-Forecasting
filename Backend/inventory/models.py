from django.db import models
from django.contrib.auth.models import User
from forecasting.models import Product
import uuid

class InventoryLevel(models.Model):
    """Current inventory status and optimization"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='inventory_level')
    current_stock = models.IntegerField(default=0)
    minimum_stock_level = models.IntegerField() # Reorder point
    maximum_stock_level = models.IntegerField() # Maximum capacity
    safety_stock = models.IntegerField() # Buffer stock
    reorder_quantity = models.IntegerField() # Economic order quantity
    holding_cost_per_unit = models.DecimalField(max_digits=10, decimal_places=2) # Cost to store per unit/day
    updated_at = models.DateTimeField(auto_now=True)

    
    class Meta:
        indexes = [
            models.Index(fields=['current_stock']),
        ]

    def __str__(self):
        return f"{self.product.name} - Stock: {self.current_stock}/{self.maximum_stock_level}"

    @property
    def stock_out_risk(self):
        """Calculate stockout risk"""
        if self.current_stock <= self.minimum_stock_level:
            return 'HIGH'
        elif self.current_stock <= self.safety_stock * 2:
            return 'MEDIUM'
        return 'LOW'
    

class StockMovement(models.Model):
    """Inventory movement tracking"""
    MOVEMENT_TYPE_CHOICES = [
    ('inbound', 'Inbound (Purchase)'),
    ('outbound', 'Outbound (Sale)'),
    ('adjustment', 'Adjustment'),
    ('return', 'Return'),
    ]

    inventory = models.ForeignKey(InventoryLevel, on_delete=models.CASCADE, related_name='movements')
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPE_CHOICES)
    quantity = models.IntegerField()
    reference_id = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['inventory', 'created_at']),
        ]