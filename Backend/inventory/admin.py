from django.contrib import admin
from .models import InventoryLevel, StockMovement

@admin.register(InventoryLevel)
class InventoryLevelAdmin(admin.ModelAdmin):
    list_display = ['product', 'current_stock', 'minimum_stock_level', 'maximum_stock_level', 'stock_out_risk']
    list_filter = ['updated_at']

admin.site.register(StockMovement)
