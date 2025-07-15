# FastAPI Backend 本地部署指南

本指南将帮助你使用Docker和本地Python环境成功部署FastAPI Backend项目。

## 📋 前置要求

### 必需软件
- **Docker Desktop** (版本 27.3.1 或更高)
- **Python 3.13** (或 3.10+)
- **Git**

### 验证安装
```bash
# 检查Docker
docker --version
docker compose version

# 检查Python
python3 --version

# 检查Git
git --version
```

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone <your-repository-url>
cd rabbit_admin
```

### 2. 创建环境配置文件
在项目根目录创建 `.env` 文件：

```bash
cat > .env << 'EOF'
# Environment
ENVIRONMENT=local
DOMAIN=localhost

# Project
PROJECT_NAME="FastAPI Project"
STACK_NAME="fastapi-project"

# Security
SECRET_KEY=changethis
FIRST_SUPERUSER=admin@example.com
FIRST_SUPERUSER_PASSWORD=changethis

# Database
POSTGRES_SERVER=db
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=CIPhID8CFbng_zeLPiZE4mfp0zCp_mGca-uY4DY58ZY
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
```

### 3. 生成安全密钥
```bash
# 生成SECRET_KEY
python3 -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))"

# 生成POSTGRES_PASSWORD
python3 -c "import secrets; print('POSTGRES_PASSWORD=' + secrets.token_urlsafe(32))"

# 生成FIRST_SUPERUSER_PASSWORD
python3 -c "import secrets; print('FIRST_SUPERUSER_PASSWORD=' + secrets.token_urlsafe(32))"
```

### 4. 更新环境变量
将生成的密钥替换到 `.env` 文件中：

```bash
# 替换SECRET_KEY (使用你生成的密钥)
sed -i '' 's/SECRET_KEY=changethis/SECRET_KEY=your_generated_secret_key/' .env

# 替换POSTGRES_PASSWORD (使用你生成的密钥)
sed -i '' 's/POSTGRES_PASSWORD=changethis/POSTGRES_PASSWORD=your_generated_password/' .env

# 替换FIRST_SUPERUSER_PASSWORD (使用你生成的密钥)
sed -i '' 's/FIRST_SUPERUSER_PASSWORD=changethis/FIRST_SUPERUSER_PASSWORD=your_generated_password/' .env
```

### 5. 启动数据库
```bash
# 启动PostgreSQL数据库
docker compose up -d db

# 验证数据库状态
docker compose ps
```

### 6. 设置Python环境
```bash
# 进入backend目录
cd backend

# 创建虚拟环境
python3 -m venv .venv

# 激活虚拟环境
source .venv/bin/activate

# 安装依赖
pip install "fastapi[standard]" python-multipart email-validator "passlib[bcrypt]" tenacity pydantic emails jinja2 alembic httpx "psycopg[binary]" sqlmodel "bcrypt==4.3.0" pydantic-settings "sentry-sdk[fastapi]" pyjwt sqlalchemy

# 返回项目根目录
cd ..
```

### 7. 启动Backend
```bash
# 设置环境变量
export PROJECT_NAME="FastAPI Project"
export POSTGRES_SERVER="localhost"
export POSTGRES_USER="postgres"
export FIRST_SUPERUSER="admin@example.com"
export FIRST_SUPERUSER_PASSWORD="admin12345"
export PYTHONPATH=/Users/zhangchun/Documents/rabbit_admin/backend

# 启动FastAPI应用
backend/.venv/bin/uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

## ✅ 验证部署

### 健康检查
```bash
curl http://localhost:8000/api/v1/utils/health-check/
# 应该返回: true
```

### 访问API文档
在浏览器中打开：
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 检查进程状态
```bash
# 检查uvicorn进程
ps aux | grep uvicorn

# 检查数据库容器
docker compose ps
```

## 🔧 配置说明

### 环境变量详解

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `ENVIRONMENT` | 运行环境 | `local` |
| `DOMAIN` | 域名 | `localhost` |
| `PROJECT_NAME` | 项目名称 | `"FastAPI Project"` |
| `SECRET_KEY` | 安全密钥 | 需要生成 |
| `FIRST_SUPERUSER` | 管理员邮箱 | `admin@example.com` |
| `FIRST_SUPERUSER_PASSWORD` | 管理员密码 | 需要生成 |
| `POSTGRES_SERVER` | 数据库主机 | `localhost` |
| `POSTGRES_PORT` | 数据库端口 | `5432` |
| `POSTGRES_USER` | 数据库用户 | `postgres` |
| `POSTGRES_PASSWORD` | 数据库密码 | 需要生成 |
| `POSTGRES_DB` | 数据库名称 | `app` |

### 端口配置

| 服务 | 端口 | 说明 |
|------|------|------|
| Backend API | 8000 | FastAPI应用 |
| PostgreSQL | 5432 | 数据库 |
| Adminer | 8080 | 数据库管理界面 |

## 🛠️ 故障排除

### 常见问题

#### 1. 数据库连接失败
```bash
# 检查数据库容器状态
docker compose ps

# 查看数据库日志
docker compose logs db

# 重启数据库
docker compose restart db
```

#### 2. 依赖安装失败
```bash
# 确保在虚拟环境中
source backend/.venv/bin/activate

# 升级pip
pip install --upgrade pip

# 重新安装依赖
pip install -r requirements.txt  # 如果有requirements.txt文件
```

#### 3. 端口被占用
```bash
# 检查端口占用
lsof -i :8000

# 杀死占用进程
kill -9 <PID>
```

#### 4. 环境变量未加载
```bash
# 检查.env文件是否存在
ls -la .env

# 手动设置环境变量
export PROJECT_NAME="FastAPI Project"
export POSTGRES_SERVER="localhost"
# ... 其他变量
```

### 日志查看
```bash
# 查看Docker容器日志
docker compose logs

# 查看特定服务日志
docker compose logs db
docker compose logs backend

# 查看实时日志
docker compose logs -f
```

## 🔄 重启服务

### 重启整个栈
```bash
# 停止所有服务
docker compose down

# 重新启动
docker compose up -d db
# 然后重新启动backend
```

### 重启Backend
```bash
# 停止uvicorn进程
pkill -f uvicorn

# 重新启动
backend/.venv/bin/uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

## 🧹 清理环境

### 停止所有服务
```bash
# 停止Docker容器
docker compose down

# 停止uvicorn进程
pkill -f uvicorn
```

### 清理数据
```bash
# 删除数据库数据（谨慎使用）
docker compose down -v

# 删除虚拟环境
rm -rf backend/.venv
```

## 📚 开发模式

### 使用Docker Compose（推荐用于开发）
```bash
# 启动完整开发环境
docker compose watch

# 访问地址：
# - Frontend: http://localhost:5173
# - Backend: http://localhost:8000
# - API文档: http://localhost:8000/docs
# - Adminer: http://localhost:8080
```

### 本地开发模式
```bash
# 只启动数据库
docker compose up -d db

# 本地运行backend（支持热重载）
backend/.venv/bin/uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

## 🔐 安全注意事项

1. **生产环境**：确保更改所有默认密码和密钥
2. **环境变量**：不要将包含敏感信息的.env文件提交到版本控制
3. **网络访问**：生产环境应配置防火墙和HTTPS
4. **数据库安全**：使用强密码，限制数据库访问

## 📞 支持

如果遇到问题：
1. 检查本故障排除部分
2. 查看项目原始README.md
3. 检查GitHub Issues
4. 查看Docker和FastAPI官方文档

---

**部署成功！** 🎉

现在你可以访问 http://localhost:8000/docs 开始使用API了！ 

### 解决方案

1. **运行初始化脚本，自动创建超级用户：**

```sh
export $(cat .env | grep -v '^#' | grep -v '^\s*$') && \
backend/.venv/bin/python backend/app/initial_data.py
```

> 如果你用的是 fish/zsh，直接用 `export $(cat .env | grep -v '^#' | grep -v '^\s*$')` 可能会有问题，可以手动导出关键变量，或者用 `dotenv` 工具。

2. **确认数据库中出现了超级用户。**
   - 再次查看用户表，应该有一条 `admin@example.com` 的记录。

3. **再次尝试登录接口。**

---

如果你需要我帮你自动执行初始化脚本，请告知你用的 shell（bash/zsh），我可以帮你写一条适配你环境的命令！ 