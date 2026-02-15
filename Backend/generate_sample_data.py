import os
import django
import random
from datetime import datetime, timedelta
import uuid

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from forecasting.models import Product, HistoricalDemand
from inventory.models import InventoryLevel
from procurement.models import Supplier

def generate_sample_data():
    print("Starting sample data generation...")
    
    # 1. Create Suppliers
    suppliers = []
    supplier_names = ["Global Materials Co.", "Industrial Supplies Ltd.", "Fast logistics partners"]
    for name in supplier_names:
        supplier, created = Supplier.objects.get_or_create(
            name=name,
            defaults={
                'contact_email': f'info@{name.lower().replace(" ", "")}.com',
                'contact_phone': '+1234567890',
                'location': 'Mumbai, India',
                'average_lead_time_days': random.randint(3, 10),
                'reliability_score': random.uniform(0.85, 0.99)
            }
        )
        suppliers.append(supplier)
    print(f"Created {len(suppliers)} suppliers.")

    # 2. Create Products
    products_data = [
        {"name": "Steel Sheet 2mm", "sku": "STEEL-001", "category": "Raw Metals", "price": 45.00},
        {"name": "Aluminum Pipe 50mm", "sku": "ALUM-002", "category": "Raw Metals", "price": 120.50},
        {"name": "Copper Wire 10AWG", "sku": "COPP-003", "category": "Electrical", "price": 85.00},
        {"name": "Industrial Gear Oil 20L", "sku": "OIL-004", "category": "Lubricants", "price": 250.00},
        {"name": "Nylon Filament 1.75mm", "sku": "NYLN-005", "category": "Polymers", "price": 35.00},
    ]

    products = []
    for p_info in products_data:
        product, created = Product.objects.get_or_create(
            sku=p_info['sku'],
            defaults={
                'name': p_info['name'],
                'category': p_info['category'],
                'current_price': p_info['price'],
                'unit_of_measurement': 'units',
                'lead_time_days': random.randint(5, 15)
            }
        )
        products.append(product)
        
        # Create Inventory Level for each product
        InventoryLevel.objects.get_or_create(
            product=product,
            defaults={
                'current_stock': random.randint(100, 500),
                'minimum_stock_level': 50,
                'maximum_stock_level': 1000,
                'safety_stock': 30,
                'reorder_quantity': 200,
                'holding_cost_per_unit': 0.15
            }
        )
    print(f"Created {len(products)} products and inventory records.")

    # 3. Create Historical Demand (180 days)
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=180)
    
    demand_records = 0
    for product in products:
        # Check if history already exists
        if HistoricalDemand.objects.filter(product=product).exists():
            continue
            
        current_date = start_date
        base_demand = random.randint(20, 50)
        
        records = []
        while current_date < end_date:
            # Add some seasonality and trend
            day_of_week = current_date.weekday()
            seasonality = 1.2 if day_of_week in [0, 1] else 0.8 # Higher demand on Mon/Tue
            noise = random.uniform(0.8, 1.2)
            
            quantity = int(base_demand * seasonality * noise)
            
            records.append(HistoricalDemand(
                product=product,
                date=current_date,
                quantity_demanded=quantity,
                actual_sales=max(0, quantity - random.randint(0, 5)),
                external_factors={"weekday": day_of_week}
            ))
            
            current_date += timedelta(days=1)
        
        HistoricalDemand.objects.bulk_create(records)
        demand_records += len(records)
    
    print(f"Created {demand_records} historical demand records.")
    print("Sample data generation completed successfully!")

if __name__ == '__main__':
    generate_sample_data()
