#!/bin/bash

echo "Restarting backend service..."

# 停止服务
./stop.sh

# 等待2秒
sleep 2

# 启动服务
./start.sh 