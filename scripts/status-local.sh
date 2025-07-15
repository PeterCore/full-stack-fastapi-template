#!/bin/bash

# FastAPI Backend 本地服务状态检查脚本
# 使用方法: bash scripts/status-local.sh

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

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo "📊 FastAPI Backend 本地服务状态检查"
echo "=========================================="
echo ""

# 检查Docker容器状态
print_status "检查 Docker 容器状态..."
if docker compose ps | grep -q "Up"; then
    print_success "Docker 容器运行中"
    docker compose ps
else
    print_error "Docker 容器未运行"
fi
echo ""

# 检查Backend进程
print_status "检查 Backend 进程..."
if ps aux | grep -q "uvicorn.*backend.app.main:app"; then
    print_success "Backend 进程运行中"
    ps aux | grep "uvicorn.*backend.app.main:app" | grep -v grep
else
    print_error "Backend 进程未运行"
fi
echo ""

# 检查端口占用
print_status "检查端口占用..."
if lsof -i :8000 >/dev/null 2>&1; then
    print_success "端口 8000 被占用"
    lsof -i :8000
else
    print_error "端口 8000 未被占用"
fi
echo ""

# 检查健康状态
print_status "检查 Backend 健康状态..."
if curl -s http://localhost:8000/api/v1/utils/health-check/ | grep -q "true"; then
    print_success "Backend 健康检查通过"
else
    print_error "Backend 健康检查失败"
fi
echo ""

# 检查API文档
print_status "检查 API 文档..."
if curl -s http://localhost:8000/docs | grep -q "Swagger UI"; then
    print_success "API 文档可访问"
else
    print_error "API 文档不可访问"
fi
echo ""

# 显示访问信息
echo "📋 访问信息："
echo "  • Backend API: http://localhost:8000"
echo "  • API 文档 (Swagger): http://localhost:8000/docs"
echo "  • API 文档 (ReDoc): http://localhost:8000/redoc"
echo "  • 健康检查: http://localhost:8000/api/v1/utils/health-check/"
echo ""

# 显示管理命令
echo "🛠️ 管理命令："
echo "  • 启动服务: bash scripts/deploy-local.sh"
echo "  • 停止服务: bash scripts/stop-local.sh"
echo "  • 查看日志: docker compose logs"
echo "  • 重启 Backend: pkill -f uvicorn && backend/.venv/bin/uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000"
echo "" 