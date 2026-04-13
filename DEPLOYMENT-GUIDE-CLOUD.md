# GanttXa 腾讯云部署指南

**日期**: 2026-04-13  
**目标**: 部署到腾讯云服务器（支持多项目）

---

## 📋 部署架构

```
腾讯云服务器
├── Nginx (反向代理 + SSL)
│   ├── ganttxa.yourdomain.com → GanttXa
│   ├── project2.yourdomain.com → 其他项目
│   └── project3.yourdomain.com → 其他项目
├── Docker Compose
│   ├── GanttXa (前端 + 后端 + 数据库)
│   ├── 其他项目容器
│   └── 共享网络
└── PostgreSQL (可选：共享或独立)
```

---

## 🚀 方案一：使用 Docker Compose + Nginx（推荐）

### 优势
- ✅ 多项目隔离
- ✅ 易于管理和扩展
- ✅ 支持域名访问
- ✅ 支持 HTTPS

---

## 📦 步骤 1: 准备服务器

### 1.1 连接到服务器

```bash
ssh root@your-server-ip
```

### 1.2 安装必要软件

```bash
# 更新系统
apt update && apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 安装 Docker Compose
apt install docker-compose -y

# 安装 Nginx
apt install nginx -y

# 启动 Docker
systemctl start docker
systemctl enable docker
```

---

## 📁 步骤 2: 创建项目目录结构

```bash
# 创建项目根目录
mkdir -p /opt/projects
cd /opt/projects

# 为每个项目创建目录
mkdir -p ganttxa
mkdir -p project2
mkdir -p project3

# 创建共享配置目录
mkdir -p nginx/conf.d
mkdir -p nginx/ssl
```

---

## 🐳 步骤 3: 准备 GanttXa 部署文件

### 3.1 优化 docker-compose.yml

在本地创建生产环境的 docker-compose 文件：

```bash
cd gattxa
```

创建 `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  # PostgreSQL 数据库
  postgres:
    image: postgres:15-alpine
    container_name: ganttxa-postgres
    restart: always
    environment:
      POSTGRES_DB: ganttxa
      POSTGRES_USER: ganttxa_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/01-init.sql
      - ./database/migrations:/docker-entrypoint-initdb.d/migrations
    networks:
      - ganttxa-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ganttxa_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  # 后端服务
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: ganttxa-backend
    restart: always
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: postgresql://ganttxa_user:${DB_PASSWORD}@postgres:5432/ganttxa
      JWT_SECRET: ${JWT_SECRET}
      CORS_ORIGIN: https://ganttxa.yourdomain.com
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - ganttxa-network
    expose:
      - "3000"

  # 前端服务
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
      args:
        VITE_API_URL: https://api.ganttxa.yourdomain.com
    container_name: ganttxa-frontend
    restart: always
    networks:
      - ganttxa-network
    expose:
      - "80"

networks:
  ganttxa-network:
    driver: bridge

volumes:
  postgres_data:
```

### 3.2 创建生产环境 Dockerfile

**后端 Dockerfile.prod**:

```dockerfile
# backend/Dockerfile.prod
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建
RUN npm run build

# 生产镜像
FROM node:18-alpine

WORKDIR /app

# 复制构建产物和依赖
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# 创建上传目录
RUN mkdir -p /app/uploads

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

**前端 Dockerfile.prod**:

```dockerfile
# frontend/Dockerfile.prod
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
RUN npm ci

# 复制源代码
COPY . .

# 构建参数
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# 构建
RUN npm run build

# 生产镜像 - 使用 Nginx
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**前端 nginx.conf**:

```nginx
# frontend/nginx.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理（可选）
    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3.3 创建 .env.prod 文件

```bash
# .env.prod
DB_PASSWORD=your_secure_db_password_here
JWT_SECRET=your_secure_jwt_secret_here
```

---

## 🌐 步骤 4: 配置 Nginx 反向代理

### 4.1 创建 Nginx 配置

在服务器上创建 `/etc/nginx/sites-available/ganttxa`:

```nginx
# /etc/nginx/sites-available/ganttxa

# 前端
server {
    listen 80;
    server_name ganttxa.yourdomain.com;

    # 重定向到 HTTPS（可选）
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# 后端 API
server {
    listen 80;
    server_name api.ganttxa.yourdomain.com;

    # 重定向到 HTTPS（可选）
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # WebSocket 支持
        proxy_read_timeout 86400;
    }
}
```

### 4.2 启用配置

```bash
# 创建软链接
ln -s /etc/nginx/sites-available/ganttxa /etc/nginx/sites-enabled/

# 测试配置
nginx -t

# 重启 Nginx
systemctl restart nginx
```

---

## 🚢 步骤 5: 部署到服务器

### 5.1 推送代码到服务器

**方法 1: 使用 Git（推荐）**

```bash
# 在服务器上
cd /opt/projects/ganttxa
git clone https://github.com/fukkix/ganttxa.git .

# 或者如果已经克隆，拉取最新代码
git pull origin main
```

**方法 2: 使用 SCP**

```bash
# 在本地
cd gattxa
scp -r . root@your-server-ip:/opt/projects/ganttxa/
```

### 5.2 配置环境变量

```bash
cd /opt/projects/ganttxa

# 复制环境变量文件
cp .env.prod .env

# 编辑环境变量
nano .env
```

### 5.3 构建和启动服务

```bash
# 构建镜像
docker-compose -f docker-compose.prod.yml build

# 启动服务
docker-compose -f docker-compose.prod.yml up -d

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f
```

### 5.4 运行数据库迁移

```bash
# 进入后端容器
docker exec -it ganttxa-backend sh

# 运行迁移（如果需要）
# 或者直接在 PostgreSQL 容器中执行
docker exec -it ganttxa-postgres psql -U ganttxa_user -d ganttxa -f /docker-entrypoint-initdb.d/migrations/004_add_version_to_tasks.sql
```

---

## 🔒 步骤 6: 配置 HTTPS（可选但推荐）

### 6.1 安装 Certbot

```bash
apt install certbot python3-certbot-nginx -y
```

### 6.2 获取 SSL 证书

```bash
# 为域名申请证书
certbot --nginx -d ganttxa.yourdomain.com -d api.ganttxa.yourdomain.com

# 自动续期
certbot renew --dry-run
```

### 6.3 更新 Nginx 配置

Certbot 会自动更新 Nginx 配置，添加 HTTPS 支持。

---

## 🔧 步骤 7: 配置防火墙

```bash
# 允许 HTTP 和 HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# 允许 SSH
ufw allow 22/tcp

# 启用防火墙
ufw enable
```

---

## 📊 步骤 8: 监控和维护

### 8.1 查看服务状态

```bash
# 查看所有容器
docker ps

# 查看 GanttXa 容器
docker-compose -f docker-compose.prod.yml ps

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### 8.2 重启服务

```bash
# 重启所有服务
docker-compose -f docker-compose.prod.yml restart

# 重启单个服务
docker-compose -f docker-compose.prod.yml restart backend
```

### 8.3 更新部署

```bash
# 拉取最新代码
git pull origin main

# 重新构建
docker-compose -f docker-compose.prod.yml build

# 重启服务
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🎯 方案二：使用端口映射（简单方案）

如果不想配置域名，可以使用端口映射：

### 修改 docker-compose.prod.yml

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # GanttXa 前端
  
  backend:
    ports:
      - "3000:3000"  # GanttXa 后端
```

### 访问方式

- 前端: `http://your-server-ip:8080`
- 后端: `http://your-server-ip:3000`

### 其他项目使用不同端口

- 项目 2: 8081, 3001
- 项目 3: 8082, 3002

---

## 🔍 故障排查

### 问题 1: 容器无法启动

```bash
# 查看详细日志
docker-compose -f docker-compose.prod.yml logs

# 检查容器状态
docker ps -a
```

### 问题 2: 数据库连接失败

```bash
# 检查数据库是否运行
docker exec -it ganttxa-postgres psql -U ganttxa_user -d ganttxa

# 检查网络连接
docker network inspect ganttxa_ganttxa-network
```

### 问题 3: Nginx 502 错误

```bash
# 检查后端是否运行
curl http://localhost:3000

# 检查 Nginx 日志
tail -f /var/log/nginx/error.log
```

---

## 📝 多项目部署示例

### 目录结构

```
/opt/projects/
├── ganttxa/
│   ├── docker-compose.prod.yml
│   └── .env
├── project2/
│   ├── docker-compose.yml
│   └── .env
└── project3/
    ├── docker-compose.yml
    └── .env
```

### Nginx 配置

```nginx
# GanttXa
server {
    listen 80;
    server_name ganttxa.yourdomain.com;
    location / {
        proxy_pass http://localhost:8080;
    }
}

# 项目 2
server {
    listen 80;
    server_name project2.yourdomain.com;
    location / {
        proxy_pass http://localhost:8081;
    }
}

# 项目 3
server {
    listen 80;
    server_name project3.yourdomain.com;
    location / {
        proxy_pass http://localhost:8082;
    }
}
```

---

## ✅ 部署检查清单

- [ ] 服务器已安装 Docker 和 Docker Compose
- [ ] 已安装 Nginx
- [ ] 已创建项目目录
- [ ] 已配置环境变量
- [ ] 已配置 Nginx 反向代理
- [ ] 已配置防火墙
- [ ] 已构建 Docker 镜像
- [ ] 已启动所有服务
- [ ] 已运行数据库迁移
- [ ] 已配置 HTTPS（可选）
- [ ] 已测试访问

---

## 🚀 快速部署脚本

创建 `deploy.sh`:

```bash
#!/bin/bash

# 部署脚本
echo "🚀 开始部署 GanttXa..."

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin main

# 构建镜像
echo "🔨 构建 Docker 镜像..."
docker-compose -f docker-compose.prod.yml build

# 停止旧服务
echo "🛑 停止旧服务..."
docker-compose -f docker-compose.prod.yml down

# 启动新服务
echo "▶️  启动新服务..."
docker-compose -f docker-compose.prod.yml up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "✅ 检查服务状态..."
docker-compose -f docker-compose.prod.yml ps

echo "🎉 部署完成！"
```

使用方法：

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 📞 需要帮助？

如果遇到问题，请查看：
- [部署检查清单](DEPLOYMENT-CHECKLIST.md)
- [开发进度报告](DEVELOPMENT-PROGRESS.md)
- Docker 官方文档
- Nginx 官方文档

---

**部署指南版本**: 1.0  
**最后更新**: 2026-04-13

