from django.contrib import admin
from django.urls import path, include
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
]