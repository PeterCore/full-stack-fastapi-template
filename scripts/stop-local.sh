#!/bin/bash

# FastAPI Backend 本地服务停止脚本
# 使用方法: bash scripts/stop-local.sh

set -e

echo "🛑 停止 FastAPI Backend 本地服务..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 停止Docker容器
print_status "停止 Docker 容器..."
docker compose down 2>/dev/null || true
print_success "Docker 容器已停止"

# 停止uvicorn进程
print_status "停止 Backend 进程..."
if pkill -f uvicorn; then
    print_success "Backend 进程已停止"
else
    print_warning "没有找到运行中的 Backend 进程"
fi

# 检查端口是否释放
sleep 2
if lsof -i :8000 >/dev/null 2>&1; then
    print_warning "端口 8000 仍被占用，强制停止..."
    pkill -9 -f uvicorn 2>/dev/null || true
    sleep 1
fi

if ! lsof -i :8000 >/dev/null 2>&1; then
    print_success "端口 8000 已释放"
else
    print_warning "端口 8000 仍被占用，请手动检查"
fi

echo ""
echo "✅ 所有服务已停止"
echo ""
echo "📋 清理命令："
echo "  • 删除数据库数据: docker compose down -v"
echo "  • 删除虚拟环境: rm -rf backend/.venv"
echo "  • 删除环境配置: rm .env"
echo "" 