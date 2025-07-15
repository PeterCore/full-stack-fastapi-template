#!/bin/bash

echo "🔄 Restarting Rabbit Admin System..."

# 停止所有服务
./stop-all.sh

# 等待2秒
sleep 2

# 启动所有服务
./start-all.sh 