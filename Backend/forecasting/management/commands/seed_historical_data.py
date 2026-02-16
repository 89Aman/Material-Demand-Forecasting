"""
Management command to seed historical demand data for all products.
"""
import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from forecasting.models import Product, HistoricalDemand


class Command(BaseCommand):
    help = 'Seed historical demand data for all products that have fewer than 30 records'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days', type=int, default=90,
            help='Number of days of historical data to generate (default: 90)'
        )
        parser.add_argument(
            '--force', action='store_true',
            help='Regenerate data even for products that already have enough records'
        )

    def handle(self, *args, **options):
        days = options['days']
        force = options['force']
        products = Product.objects.all()

        if not products.exists():
            self.stdout.write(self.style.WARNING('No products found in the database.'))
            return

        today = date.today()

        for product in products:
            existing_count = HistoricalDemand.objects.filter(product=product).count()

            if existing_count >= 30 and not force:
                self.stdout.write(
                    f'  Skipping {product.name} - already has {existing_count} records'
                )
                continue

            if force:
                HistoricalDemand.objects.filter(product=product).delete()

            # Generate realistic demand data with trends and seasonality
            base_demand = random.uniform(50, 500)
            trend = random.uniform(-0.5, 2.0)  # slight upward trend
            seasonality_amplitude = random.uniform(10, 50)
            noise_level = random.uniform(5, 30)

            records = []
            for i in range(days):
                d = today - timedelta(days=days - i)
                day_of_week = d.weekday()

                # Base + trend
                demand = base_demand + (trend * i)

                # Weekly seasonality (lower on weekends)
                if day_of_week >= 5:
                    demand *= 0.6
                elif day_of_week == 0:
                    demand *= 0.85

                # Monthly seasonality
                import math
                demand += seasonality_amplitude * math.sin(2 * math.pi * i / 30)

                # Random noise
                demand += random.gauss(0, noise_level)

                # Ensure non-negative
                demand = max(1, demand)

                records.append(HistoricalDemand(
                    product=product,
                    date=d,
                    quantity_demanded=round(demand),
                    actual_sales=round(demand * random.uniform(0.85, 1.05)),
                ))

            HistoricalDemand.objects.bulk_create(records, ignore_conflicts=True)
            self.stdout.write(
                self.style.SUCCESS(
                    f'  ✓ {product.name}: Created {len(records)} historical records'
                )
            )

        self.stdout.write(self.style.SUCCESS('\nDone! All products now have historical data.'))
