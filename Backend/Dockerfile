FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# Create startup script
RUN echo '#!/bin/bash\npython manage.py migrate --noinput\npython manage.py seed_historical_data --days 90\nexec gunicorn --bind 0.0.0.0:$PORT config.wsgi:application' > /app/start.sh && chmod +x /app/start.sh

CMD ["/app/start.sh"]
