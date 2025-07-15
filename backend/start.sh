#!/bin/bash

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
echo "Starting backend service..."
.venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload 