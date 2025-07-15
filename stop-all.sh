#!/bin/bash

echo "🛑 Stopping Rabbit Admin System..."

# 停止后端服务
echo "🔧 Stopping backend service..."
pkill -f uvicorn

# 停止数据库
echo "📦 Stopping database..."
docker-compose down

echo "✅ All services stopped." 