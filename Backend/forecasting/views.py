from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
import pandas as pd

from .models import Product, HistoricalDemand, Forecast, ForecastDetail
from .serializers import ProductSerializer, HistoricalDemandSerializer, ForecastSerializer, BulkForecastSerializer
from .ml_engine import DemandForecaster

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['name', 'sku', 'category']
    ordering_fields = ['created_at', 'name']

class HistoricalDemandViewSet(viewsets.ModelViewSet):
    queryset = HistoricalDemand.objects.all()
    serializer_class = HistoricalDemandSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['product__name', 'product__sku']
    ordering_fields = ['date', 'quantity_demanded']


@action(detail=False, methods=['post'])
def bulk_create(self, request):
    """Bulk upload historical demand data"""
    serializer = HistoricalDemandSerializer(data=request.data, many=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ForecastViewSet(viewsets.ModelViewSet):
    queryset = Forecast.objects.all()
    serializer_class = ForecastSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['product__name', 'algorithm']
    ordering_fields = ['forecast_date', 'accuracy_score']

    
    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Generate forecasts for products"""
        serializer = BulkForecastSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        algorithm = serializer.validated_data.get('algorithm', 'ensemble')
        horizon = serializer.validated_data.get('forecast_horizon_days', 30)
        product_ids = serializer.validated_data.get('product_ids')
        
        if product_ids:
            products = Product.objects.filter(id__in=product_ids)
        else:
            products = Product.objects.all()
        
        created_forecasts = []
        
        for product in products:
            try:
                # Get historical data
                history = HistoricalDemand.objects.filter(product=product).order_by('date')
                
                if history.count() < 30:
                    continue
                
                # Prepare data
                data = list(history.values('date', 'quantity_demanded'))
                df = pd.DataFrame(data)
                
                if len(df) < 20:
                    continue
                
                # Forecast
                forecaster = DemandForecaster(df)
                result = forecaster.forecast(algorithm=algorithm, horizon_days=horizon)
                
                # Save forecast
                forecast_date = timezone.now().date()
                forecast = Forecast.objects.create(
                    product=product,
                    algorithm=algorithm,
                    forecast_date=forecast_date,
                    predicted_demand=float(result['forecast']),
                    confidence_interval_lower=float(result['lower_bound']),
                    confidence_interval_upper=float(result['upper_bound']),
                    mae=result.get('mae'),
                    rmse=result.get('rmse'),
                    mape=result.get('mape'),
                    accuracy_score=result.get('accuracy'),
                    status='completed',
                    forecast_horizon_days=horizon,
                )
                
                # Save detailed forecasts
                future_date = forecast_date
                for i, (pred, lower, upper) in enumerate(zip(result['forecast'], result['lower_bound'], result['upper_bound'])):
                    ForecastDetail.objects.create(
                        forecast=forecast,
                        forecast_date=future_date + timedelta(days=i),
                        predicted_quantity=float(pred),
                        lower_bound=float(lower),
                        upper_bound=float(upper),
                    )
                
                created_forecasts.append(forecast.id)
                
            except Exception as e:
                logger.error(f"Forecast generation error for {product.name}: {str(e)}")
                Forecast.objects.create(
                    product=product,
                    algorithm=algorithm,
                    forecast_date=timezone.now().date(),
                    predicted_demand=0,
                    confidence_interval_lower=0,
                    confidence_interval_upper=0,
                    status='failed',
                    error_message=str(e),
                )
        
        return Response({
            'created_forecasts': created_forecasts,
            'total_forecasted': len(created_forecasts),
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def accuracy_report(self, request):
        """Get forecast accuracy metrics"""
        forecasts = Forecast.objects.filter(status='completed')
        
        report = {
            'total_forecasts': forecasts.count(),
            'avg_accuracy': forecasts.filter(accuracy_score__isnull=False).aggregate(models.Avg('accuracy_score'))['accuracy_score__avg'],
            'avg_mae': forecasts.filter(mae__isnull=False).aggregate(models.Avg('mae'))['mae__avg'],
            'avg_rmse': forecasts.filter(rmse__isnull=False).aggregate(models.Avg('rmse'))['rmse__avg'],
            'avg_mape': forecasts.filter(mape__isnull=False).aggregate(models.Avg('mape'))['mape__avg'],
        }
        
        return Response(report)