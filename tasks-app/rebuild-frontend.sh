#!/bin/bash
# Quick rebuild frontend

echo "🔨 Building frontend image..."
docker build -t tasks-app-frontend:latest ./frontend

echo "🔄 Restarting frontend container..."
docker compose restart frontend

echo "✅ Done! Frontend updated."
