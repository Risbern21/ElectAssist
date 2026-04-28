# -------------------------------------------------
# Stage 1 – Build the React frontend
# -------------------------------------------------
FROM node:20-alpine AS frontend-builder

# Declare build-time args for every Vite env var
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_MAPS_API_KEY

# Expose them as ENV so Vite picks them up at build time
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY \
    VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN \
    VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID \
    VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET \
    VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID \
    VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID \
    VITE_MAPS_API_KEY=$VITE_MAPS_API_KEY \
    VITE_API_BASE_URL=/api

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --silent
COPY frontend/ .
RUN npm run build                 # → /app/frontend/dist

# -------------------------------------------------
# Stage 2 – Backend (FastAPI) + static assets
# -------------------------------------------------
FROM python:3.11-slim AS backend

# Prevent .pyc files & enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# System build tools (needed for some wheels)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source (core, routers, schemas, services, static folder)
COPY backend/ .
# Remove any local .env files — Cloud Run uses Application Default Credentials (ADC)
RUN find /app -name ".env" -delete && \
    find /app -name "*.env" -delete

# Pull the compiled React assets from the builder stage
COPY --from=frontend-builder /app/frontend/dist ./static

# Cloud Run expects the PORT env var
ENV PORT 8080
EXPOSE 8080

# Runtime command
CMD ["sh","-c","uvicorn main:app --host 0.0.0.0 --port ${PORT}"]