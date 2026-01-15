from django.contrib import admin
from .models import Supplier, ProcurementOrder

@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ['name', 'contact_email', 'average_lead_time_days', 'reliability_score']

@admin.register(ProcurementOrder)
class ProcurementOrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'product', 'supplier', 'quantity', 'status', 'order_date']
    list_filter = ['status', 'order_date']
    search_fields = ['product__name', 'supplier__name']
