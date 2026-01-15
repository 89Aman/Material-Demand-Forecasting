from django.contrib import admin
from .models import Product, HistoricalDemand, Forecast, ForecastDetail

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'sku', 'category', 'current_price']
    search_fields = ['name', 'sku']
    list_filter = ['category']

@admin.register(HistoricalDemand)
class HistoricalDemandAdmin(admin.ModelAdmin):
    list_display = ['product', 'date', 'quantity_demanded', 'actual_sales']
    list_filter = ['date', 'product']
    search_fields = ['product__name']

@admin.register(Forecast)
class ForecastAdmin(admin.ModelAdmin):
    list_display = ['product', 'algorithm', 'forecast_date', 'predicted_demand', 'accuracy_score']
    list_filter = ['algorithm', 'status', 'forecast_date']
    search_fields = ['product__name']

admin.site.register(ForecastDetail)
