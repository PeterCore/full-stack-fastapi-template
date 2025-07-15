#!/bin/bash

echo "🚀 Starting Rabbit Admin System..."

# 检查是否在正确的目录
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the project root directory (rabbit_admin/)"
    exit 1
fi

# 1. 启动数据库
echo "📦 Starting database..."
docker-compose up -d db

# 等待数据库启动
echo "⏳ Waiting for database to be ready..."
sleep 5

# 检查数据库连接
echo "🔍 Checking database connection..."
if PGPASSWORD=CIPhID8CFbng_zeLPiZE4mfp0zCp_mGca-uY4DY58ZY psql -h localhost -U postgres -d app -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database is ready"
else
    echo "❌ Database connection failed. Please check if PostgreSQL container is running."
    exit 1
fi

# 2. 启动后端
echo "🔧 Starting backend service..."
cd backend

# 设置环境变量
export POSTGRES_SERVER=localhost
export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=CIPhID8CFbng_zeLPiZE4mfp0zCp_mGca-uY4DY58ZY
export POSTGRES_DB=app
export POSTGRES_PORT=5432
export PROJECT_NAME="minyes-backend"
export FIRST_SUPERUSER=admin@example.com
export FIRST_SUPERUSER_PASSWORD=admin12345

# 启动后端服务
echo "🌐 Backend service starting on http://localhost:8000"
.venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload 