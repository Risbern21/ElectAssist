# Use an official lightweight Python runtime
FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# Prevent Python from writing .pyc files & buffer clearing
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system essentials
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend codebase
COPY . .

# Copy the frontend dist (previously copied to backend/static)
COPY ./static ./static

# Cloud Run uses the PORT environment variable
ENV PORT 8080
EXPOSE 8080

# Specify the command to run the Uvicorn application
# We use the PORT environment variable
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
