from rest_framework import serializers
from .models import Product, HistoricalDemand, Forecast, ForecastDetail

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class HistoricalDemandSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)


    class Meta:
        model = HistoricalDemand
        fields = ['id', 'product', 'product_name', 'date', 'quantity_demanded', 'actual_sales', 'external_factors', 'created_at']
class ForecastDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForecastDetail
        fields = ['forecast_date', 'predicted_quantity', 'lower_bound', 'upper_bound']


class ForecastSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    details = ForecastDetailSerializer(many=True, read_only=True)

    class Meta:
        model = Forecast
        fields = ['id', 'product', 'product_name', 'algorithm', 'forecast_date', 'predicted_demand', 
                'confidence_interval_lower', 'confidence_interval_upper', 'mae', 'rmse', 'mape', 
                'accuracy_score', 'status', 'forecast_horizon_days', 'error_message', 'details', 'created_at']
        
class BulkForecastSerializer(serializers.Serializer):
    algorithm = serializers.ChoiceField(choices=['arima', 'xgboost', 'prophet', 'ensemble'])
    forecast_horizon_days = serializers.IntegerField(default=30, min_value=1, max_value=365)
    product_ids = serializers.ListField(child=serializers.UUIDField(), required=False)