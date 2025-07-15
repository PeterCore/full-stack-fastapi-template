# 🚀 快速开始指南

## 5分钟部署 FastAPI Backend

### 第一步：克隆项目
```bash
git clone <your-repository-url>
cd rabbit_admin
```

### 第二步：一键部署
```bash
bash scripts/deploy-local.sh
```

### 第三步：访问应用
部署完成后，在浏览器中打开：
- **API 文档**: http://localhost:8000/docs
- **Backend API**: http://localhost:8000

### 第四步：登录测试
使用默认管理员账户：
- **邮箱**: admin@example.com
- **密码**: 部署脚本会显示生成的密码

## 🛠️ 常用命令

```bash
# 检查服务状态
bash scripts/status-local.sh

# 停止所有服务
bash scripts/stop-local.sh

# 重新部署
bash scripts/deploy-local.sh

# 查看日志
docker compose logs

# 重启 Backend
pkill -f uvicorn && backend/.venv/bin/uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

## 📋 部署信息

### 服务端口
- **Backend API**: 8000
- **PostgreSQL**: 5432
- **Adminer**: 8080

### 访问地址
- **API 文档 (Swagger)**: http://localhost:8000/docs
- **API 文档 (ReDoc)**: http://localhost:8000/redoc
- **健康检查**: http://localhost:8000/api/v1/utils/health-check/
- **数据库管理**: http://localhost:8080

## 🔧 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   lsof -i :8000
   kill -9 <PID>
   ```

2. **数据库连接失败**
   ```bash
   docker compose restart db
   ```

3. **依赖安装失败**
   ```bash
   cd backend
   source .venv/bin/activate
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. **环境变量问题**
   ```bash
   # 检查.env文件
   ls -la .env
   
   # 重新生成
   bash scripts/deploy-local.sh
   ```

## 📚 更多资源

- [完整部署指南](./DEPLOYMENT_README.md)
- [原始部署文档](./deployment.md)
- [开发指南](./development.md)
- [Backend文档](./backend/README.md)

## 🆘 获取帮助

如果遇到问题：
1. 查看故障排除部分
2. 检查详细部署文档
3. 查看GitHub Issues
4. 联系项目维护者

---

**开始使用吧！** 🎉 