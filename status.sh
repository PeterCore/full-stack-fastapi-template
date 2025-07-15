#!/bin/bash

echo "📊 Rabbit Admin System Status"
echo "=============================="

# 检查数据库状态
echo "📦 Database Status:"
if docker ps | grep -q "rabbit_admin-db-1"; then
    echo "✅ Database container is running"
    
    # 检查数据库连接
    if PGPASSWORD=CIPhID8CFbng_zeLPiZE4mfp0zCp_mGca-uY4DY58ZY psql -h localhost -U postgres -d app -c "SELECT 1;" > /dev/null 2>&1; then
        echo "✅ Database connection is working"
    else
        echo "❌ Database connection failed"
    fi
else
    echo "❌ Database container is not running"
fi

echo ""

# 检查后端状态
echo "🔧 Backend Status:"
if ps aux | grep -q "uvicorn.*app.main:app"; then
    echo "✅ Backend service is running"
    
    # 检查API连接
    if curl -s http://localhost:8000/docs > /dev/null 2>&1; then
        echo "✅ Backend API is accessible"
    else
        echo "❌ Backend API is not accessible"
    fi
else
    echo "❌ Backend service is not running"
fi

echo ""

# 显示端口信息
echo "🌐 Port Information:"
echo "Database: localhost:5432"
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs" 