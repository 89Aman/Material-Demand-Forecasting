#!/bin/bash
set -e

echo "Running migrations..."
python manage.py migrate --noinput

echo "Seeding historical data..."
python manage.py seed_historical_data --days 90 || echo "Seeding skipped (may already exist)"

echo "Starting server..."
exec gunicorn --bind 0.0.0.0:$PORT config.wsgi:application
