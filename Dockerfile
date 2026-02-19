# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
# Build with base /static/ so assets are referenced correctly by the backend
RUN npm run build -- --base=/static/

# Stage 2: Build Backend
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
# libgomp1 is often needed for XGBoost/Scikit-learn
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY Backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend code
COPY Backend/ .

# Prepare directories for static files and templates
RUN mkdir -p templates static

# Copy Frontend build artifacts
# index.html goes to templates to be served by the catch-all view
COPY --from=frontend-builder /app/frontend/dist/index.html templates/index.html

# All other build assets go to static, to be collected by collectstatic
COPY --from=frontend-builder /app/frontend/dist/assets static/assets
# Copy any other root files (like favicon) if necessary, avoiding index.html overwrite if we cared,
# but practically copying everything to static doesn't hurt, valid static files will be served.
COPY --from=frontend-builder /app/frontend/dist/ static/

# Run collectstatic to gather all static files (backend + frontend) into STATIC_ROOT
# We set a dummy secret key for build step if needed, though settings.py has a default.
RUN python manage.py collectstatic --noinput

# Ensure start script is executable and has Unix line endings
RUN sed -i 's/\r$//' start.sh && chmod +x start.sh

# Set environment variables
ENV PORT=8000
ENV DEBUG=False

# Expose the port
EXPOSE 8000

# Default command
CMD ["./start.sh"]
