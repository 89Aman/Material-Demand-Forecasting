from django.db import models
from django.core.validators import MinValueValidator
from forecasting.models import Product
import uuid

class Supplier(models.Model):
    """Supplier information and metrics"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=20)
    location = models.CharField(max_length=255)
    average_lead_time_days = models.IntegerField(validators=[MinValueValidator(1)])
    reliability_score = models.FloatField(default=0.9, validators=[MinValueValidator(0), MinValueValidator(1)])
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return self.name

class ProcurementOrder(models.Model):
    """Purchase orders for materials"""
    ORDER_STATUS_CHOICES = [
    ('draft', 'Draft'),
    ('pending', 'Pending Approval'),
    ('approved', 'Approved'),
    ('ordered', 'Ordered'),
    ('in_transit', 'In Transit'),
    ('received', 'Received'),
    ('cancelled', 'Cancelled'),
    ]


    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='procurement_orders')
    supplier = models.ForeignKey(Supplier, on_delete=models.PROTECT, related_name='orders')
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    total_cost = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])

    order_date = models.DateField(auto_now_add=True)
    expected_delivery_date = models.DateField()
    actual_delivery_date = models.DateField(null=True, blank=True)

    status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default='draft')
    forecast_id = models.CharField(max_length=100, blank=True, help_text="Reference to forecast that triggered this order")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-order_date']
        indexes = [
            models.Index(fields=['status', 'expected_delivery_date']),
            models.Index(fields=['product', 'status']),
        ]

    def __str__(self):
        return f"PO-{self.id} - {self.product.name}"


def save(self, *args, **kwargs):
        self.total_cost = self.quantity * self.unit_cost
        super().save(*args, **kwargs)