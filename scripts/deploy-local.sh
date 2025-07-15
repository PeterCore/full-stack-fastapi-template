#!/bin/bash

# FastAPI Backend 本地一键部署脚本
# 使用方法: bash scripts/deploy-local.sh

set -e  # 遇到错误立即退出

echo "🚀 开始部署 FastAPI Backend..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查必需软件
check_requirements() {
    print_status "检查必需软件..."
    
    # 检查Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装，请先安装 Docker Desktop"
        exit 1
    fi
    
    # 检查Docker Compose
    if ! command -v docker compose &> /dev/null; then
        print_error "Docker Compose 未安装"
        exit 1
    fi
    
    # 检查Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python3 未安装"
        exit 1
    fi
    
    print_success "必需软件检查完成"
}

# 生成安全密钥
generate_secrets() {
    print_status "生成安全密钥..."
    
    # SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
    # POSTGRES_PASSWORD=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
    # //FIRST_SUPERUSER_PASSWORD=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
    FIRST_SUPERUSER_PASSWORD=admin123456
    POSTGRES_PASSWORD=CIPhID8CFbng_zeLPiZE4mfp0zCp_mGca-uY4DY58ZY
    SECRET_KEY=geK9brJtx6ZXHZ3oiXadCZpoPzJRE9Y4vfZV6OZytfc



    print_success "安全密钥生成完成"
}

# 创建环境配置文件
create_env_file() {
    print_status "创建环境配置文件..."
    
    if [ -f ".env" ]; then
        print_warning ".env 文件已存在，将备份为 .env.backup"
        mv .env .env.backup
    fi
    
    cat > .env << EOF
# Environment
ENVIRONMENT=local
DOMAIN=localhost

# Project
PROJECT_NAME="FastAPI Project"
STACK_NAME="fastapi-project"

# Security
SECRET_KEY=${SECRET_KEY}
FIRST_SUPERUSER=admin@example.com
FIRST_SUPERUSER_PASSWORD=${FIRST_SUPERUSER_PASSWORD}

# Database
POSTGRES_SERVER=db
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=app

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000", "http://localhost:8080"]

# Frontend
FRONTEND_HOST=http://localhost:5173

# Email (optional - for password recovery)
SMTP_HOST=
SMTP_USER=
SMTP_PASSWORD=
EMAILS_FROM_EMAIL=noreply@example.com

# Sentry (optional)
SENTRY_DSN=

# Docker images
DOCKER_IMAGE_BACKEND=fastapi-project-backend
DOCKER_IMAGE_FRONTEND=fastapi-project-frontend
TAG=latest
EOF
    
    print_success "环境配置文件创建完成"
}

# 启动数据库
start_database() {
    print_status "启动 PostgreSQL 数据库..."
    
    # 停止可能存在的容器
    docker compose down 2>/dev/null || true
    
    # 启动数据库
    docker compose up -d db
    
    # 等待数据库启动
    print_status "等待数据库启动..."
    sleep 10
    
    # 检查数据库状态
    if docker compose ps | grep -q "healthy"; then
        print_success "数据库启动成功"
    else
        print_error "数据库启动失败"
        docker compose logs db
        exit 1
    fi
}

# 设置Python环境
setup_python_env() {
    print_status "设置 Python 环境..."
    
    cd backend
    
    # 创建虚拟环境
    if [ ! -d ".venv" ]; then
        python3 -m venv .venv
        print_success "虚拟环境创建完成"
    else
        print_warning "虚拟环境已存在"
    fi
    
    # 激活虚拟环境并安装依赖
    source .venv/bin/activate
    
    print_status "安装 Python 依赖..."
    pip install --quiet "fastapi[standard]" python-multipart email-validator "passlib[bcrypt]" tenacity pydantic emails jinja2 alembic httpx "psycopg[binary]" sqlmodel "bcrypt==4.3.0" pydantic-settings "sentry-sdk[fastapi]" pyjwt sqlalchemy
    
    cd ..
    print_success "Python 环境设置完成"
}

# 启动Backend
start_backend() {
    print_status "启动 FastAPI Backend..."
    
    # 设置环境变量
    export PROJECT_NAME="rabbit-admin"
    export POSTGRES_SERVER="localhost"
    export POSTGRES_USER="postgres"
    export FIRST_SUPERUSER="admin@example.com"
    export FIRST_SUPERUSER_PASSWORD="${FIRST_SUPERUSER_PASSWORD}"
    export PYTHONPATH="$(pwd)/backend"
    
    # 检查端口是否被占用
    if lsof -i :8000 >/dev/null 2>&1; then
        print_warning "端口 8000 已被占用，正在停止现有进程..."
        pkill -f uvicorn || true
        sleep 2
    fi
    
    # 启动backend
    backend/.venv/bin/uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!
    
    # 等待backend启动
    print_status "等待 Backend 启动..."
    sleep 10
    
    # 检查backend是否启动成功
    if curl -s http://localhost:8000/api/v1/utils/health-check/ | grep -q "true"; then
        print_success "Backend 启动成功"
    else
        print_error "Backend 启动失败"
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    fi
}

# 验证部署
verify_deployment() {
    print_status "验证部署..."
    
    # 健康检查
    if curl -s http://localhost:8000/api/v1/utils/health-check/ | grep -q "true"; then
        print_success "健康检查通过"
    else
        print_error "健康检查失败"
        exit 1
    fi
    
    # 检查进程
    if ps aux | grep -q "uvicorn.*backend.app.main:app"; then
        print_success "Backend 进程运行正常"
    else
        print_error "Backend 进程未运行"
        exit 1
    fi
    
    # 检查数据库
    if docker compose ps | grep -q "healthy"; then
        print_success "数据库运行正常"
    else
        print_error "数据库未运行"
        exit 1
    fi
}

# 显示部署信息
show_deployment_info() {
    echo ""
    echo "🎉 部署完成！"
    echo ""
    echo "📋 部署信息："
    echo "  • Backend API: http://localhost:8000"
    echo "  • API 文档 (Swagger): http://localhost:8000/docs"
    echo "  • API 文档 (ReDoc): http://localhost:8000/redoc"
    echo "  • 健康检查: http://localhost:8000/api/v1/utils/health-check/"
    echo ""
    echo "🔐 管理员账户："
    echo "  • 邮箱: admin@example.com"
    echo "  • 密码: ${FIRST_SUPERUSER_PASSWORD}"
    echo ""
    echo "🛠️ 管理命令："
    echo "  • 停止服务: docker compose down && pkill -f uvicorn"
    echo "  • 查看日志: docker compose logs"
    echo "  • 重启 Backend: pkill -f uvicorn && backend/.venv/bin/uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000"
    echo ""
    echo "📖 更多信息请查看 DEPLOYMENT_README.md"
    echo ""
}

# 主函数
main() {
    echo "=========================================="
    echo "    FastAPI Backend 本地部署脚本"
    echo "=========================================="
    echo ""
    
    check_requirements
    generate_secrets
    create_env_file
    start_database
    setup_python_env
    start_backend
    verify_deployment
    show_deployment_info
}

# 运行主函数
main "$@" 