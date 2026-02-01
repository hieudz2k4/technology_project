#!/bin/bash

# Deployment Script for Vietnam Flag 3D App
# Usage: ./deploy.sh

APP_NAME="vietnam-flag"
PORT=3000

echo "🚀 Starting deployment for $APP_NAME..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker installed. Please re-login or run 'newgrp docker' to use it without sudo."
fi

# Build Docker Image
echo "🔨 Building Docker image..."
docker build -t $APP_NAME .

# Stop existing container if running
if [ "$(docker ps -q -f name=$APP_NAME)" ]; then
    echo "🛑 Stopping existing container..."
    docker stop $APP_NAME
    docker rm $APP_NAME
fi

# Run new container
echo "▶️ Running new container..."
docker run -d \
  --name $APP_NAME \
  --restart unless-stopped \
  -p $PORT:3000 \
  $APP_NAME

echo "✅ Deployment successful!"
echo "🌍 App is running at http://localhost:$PORT (or your server IP)"
