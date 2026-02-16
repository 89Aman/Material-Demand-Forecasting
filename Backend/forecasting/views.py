from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from django.db.models import Avg
from datetime import timedelta
import pandas as pd
import numpy as np
import logging

from .models import Product, HistoricalDemand, Forecast, ForecastDetail
from .serializers import ProductSerializer, HistoricalDemandSerializer, ForecastSerializer, BulkForecastSerializer
from .ml_engine import DemandForecaster

logger = logging.getLogger(__name__)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    search_fields = ['name', 'sku', 'category']
    ordering_fields = ['created_at', 'name']

class HistoricalDemandViewSet(viewsets.ModelViewSet):
    queryset = HistoricalDemand.objects.all()
    serializer_class = HistoricalDemandSerializer
    permission_classes = [AllowAny]
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
    permission_classes = [AllowAny]
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
        skipped_products = []
        
        for product in products:
            try:
                # Get historical data
                history = HistoricalDemand.objects.filter(product=product).order_by('date')
                
                hist_count = history.count()
                if hist_count < 5:
                    skipped_products.append({
                        'product': product.name,
                        'reason': f'Insufficient historical data ({hist_count} records, need at least 5)'
                    })
                    continue
                
                # Prepare data
                data = list(history.values('date', 'quantity_demanded'))
                df = pd.DataFrame(data)
                
                if len(df) < 5:
                    skipped_products.append({
                        'product': product.name,
                        'reason': f'Insufficient data after processing ({len(df)} records)'
                    })
                    continue
                
                # Forecast
                forecaster = DemandForecaster(df)
                result = forecaster.forecast(algorithm=algorithm, horizon_days=horizon)
                
                # Save forecast - use total demand across all forecast days
                forecast_date = timezone.now().date()
                total_demand = float(np.sum(result['forecast']))
                total_lower = float(np.sum(result['lower_bound']))
                total_upper = float(np.sum(result['upper_bound']))
                
                forecast = Forecast.objects.create(
                    product=product,
                    algorithm=algorithm,
                    forecast_date=forecast_date,
                    predicted_demand=round(total_demand, 2),
                    confidence_interval_lower=round(total_lower, 2),
                    confidence_interval_upper=round(total_upper, 2),
                    mae=float(result.get('mae', 0)),
                    rmse=float(result.get('rmse', 0)),
                    mape=float(result.get('mape', 0)),
                    accuracy_score=float(result.get('accuracy', 0)),
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
        
        response_data = {
            'created_forecasts': created_forecasts,
            'total_forecasted': len(created_forecasts),
        }
        if skipped_products:
            response_data['skipped'] = skipped_products
        
        if len(created_forecasts) == 0 and skipped_products:
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(response_data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def accuracy_report(self, request):
        """Get forecast accuracy metrics"""
        forecasts = Forecast.objects.filter(status='completed')
        
        report = {
            'total_forecasts': forecasts.count(),
            'avg_accuracy': forecasts.filter(accuracy_score__isnull=False).aggregate(Avg('accuracy_score'))['accuracy_score__avg'],
            'avg_mae': forecasts.filter(mae__isnull=False).aggregate(Avg('mae'))['mae__avg'],
            'avg_rmse': forecasts.filter(rmse__isnull=False).aggregate(Avg('rmse'))['rmse__avg'],
            'avg_mape': forecasts.filter(mape__isnull=False).aggregate(Avg('mape'))['mape__avg'],
        }
        
        return Response(report)