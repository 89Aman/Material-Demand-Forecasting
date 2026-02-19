from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from rest_framework.routers import DefaultRouter
from forecasting.views import ProductViewSet, HistoricalDemandViewSet, ForecastViewSet
from inventory.views import InventoryLevelViewSet, StockMovementViewSet
from procurement.views import SupplierViewSet, ProcurementOrderViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'historical-demand', HistoricalDemandViewSet)
router.register(r'forecasts', ForecastViewSet)
router.register(r'inventory', InventoryLevelViewSet)
router.register(r'stock-movements', StockMovementViewSet)
router.register(r'suppliers', SupplierViewSet)
router.register(r'procurement-orders', ProcurementOrderViewSet)

urlpatterns = [
path('admin/', admin.site.urls),
path('api/', include(router.urls)),
re_path(r'^.*', TemplateView.as_view(template_name='index.html')),
]