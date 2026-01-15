from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
import uuid

class Product(models.Model):
    """Product/Material catalog"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=100)
    unit_of_measurement = models.CharField(max_length=50, default='units')
    current_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    lead_time_days = models.IntegerField(default=7, validators=[MinValueValidator(1)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['sku']),
            models.Index(fields=['category']),
        ]

    def __str__(self):
        return f"{self.name} ({self.sku})"
    

class HistoricalDemand(models.Model):
    """Historical sales/demand data"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='historical_demands')
    date = models.DateField()
    quantity_demanded = models.IntegerField(validators=[MinValueValidator(0)])
    actual_sales = models.IntegerField(validators=[MinValueValidator(0)])
    external_factors = models.JSONField(default=dict, help_text="Weather, holidays, promotions, etc.")
    created_at = models.DateTimeField(auto_now_add=True)


    class Meta:
        unique_together = ['product', 'date']
        ordering = ['date']
        indexes = [
            models.Index(fields=['product', 'date']),
        ]

    def __str__(self):
        return f"{self.product.name} - {self.date}: {self.quantity_demanded} units"

class Forecast(models.Model):
    """Generated demand forecasts"""
    ALGORITHM_CHOICES = [
    ('arima', 'ARIMA'),
    ('xgboost', 'XGBoost'),
    ('prophet', 'Prophet'),
    ('moving_avg', 'Moving Average'),
    ('ensemble', 'Ensemble'),
    ]


    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('generating', 'Generating'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='forecasts')
    algorithm = models.CharField(max_length=20, choices=ALGORITHM_CHOICES)
    forecast_date = models.DateField()
    predicted_demand = models.FloatField(validators=[MinValueValidator(0)])
    confidence_interval_lower = models.FloatField(validators=[MinValueValidator(0)])
    confidence_interval_upper = models.FloatField(validators=[MinValueValidator(0)])

    # Accuracy metrics
    mae = models.FloatField(null=True, blank=True)  # Mean Absolute Error
    rmse = models.FloatField(null=True, blank=True)  # Root Mean Squared Error
    mape = models.FloatField(null=True, blank=True)  # Mean Absolute Percentage Error
    accuracy_score = models.FloatField(null=True, blank=True)  # 0-100%

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    error_message = models.TextField(blank=True, null=True)

    forecast_horizon_days = models.IntegerField(default=30)  # Days ahead forecasted
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-forecast_date']
        indexes = [
            models.Index(fields=['product', 'forecast_date']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.product.name} - {self.algorithm} - {self.forecast_date}"

class ForecastDetail(models.Model):
    """Detailed day-by-day forecast"""
    forecast = models.ForeignKey(Forecast, on_delete=models.CASCADE, related_name='details')
    forecast_date = models.DateField()
    predicted_quantity = models.FloatField()
    lower_bound = models.FloatField()
    upper_bound = models.FloatField()

    
    class Meta:
        unique_together = ['forecast', 'forecast_date']
        ordering = ['forecast_date']