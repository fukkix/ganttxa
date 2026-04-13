# GanttXa 生产环境部署指南

## 目录
1. [部署方式选择](#部署方式选择)
2. [准备工作](#准备工作)
3. [方式一：Docker Compose 部署](#方式一docker-compose-部署)
4. [方式二：云服务器手动部署](#方式二云服务器手动部署)
5. [方式三：Vercel + Railway 部署](#方式三vercel--railway-部署)
6. [环境变量配置](#环境变量配置)
7. [域名和 HTTPS 配置](#域名和-https-配置)
8. [监控和维护](#监控和维护)

---

## 部署方式选择

### 推荐方案对比

| 方案 | 成本 | 难度 | 适用场景 |
|------|------|------|---------|
| Docker Compose | 低-中 | 简单 | 有自己的服务器 |
| 云服务器手动部署 | 中 | 中等 | 需要完全控制 |
| Vercel + Railway | 低 | 最简单 | 快速上线，小团队 |
| Kubernetes | 高 | 复杂 | 大规模生产环境 |

### 本指南重点
本指南主要介绍前三种方案，适合中小型团队和个人开发者。

---

## 准备工作

### 1. 服务器要求

**最低配置**：
- CPU: 2核
- 内存: 4GB
- 硬盘: 20GB SSD
- 带宽: 5Mbps

**推荐配置**：
- CPU: 4核
- 内存: 8GB
- 硬盘: 50GB SSD
- 带宽: 10Mbps

### 2. 域名准备（可选）
- 购买域名（如 ganttxa.com）
- 配置 DNS 解析到服务器 IP

### 3. 必需软件
- Docker 20.10+
- Docker Compose 2.0+
- Git
- Nginx（如果不使用 Docker）

---

## 方式一：Docker Compose 部署

### 优点
- 一键部署，配置简单
- 环境隔离，易于维护
- 适合快速上线

### 步骤

#### 1. 连接到服务器

```bash
ssh root@your-server-ip
```

#### 2. 安装 Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

#### 3. 克隆项目

```bash
cd /opt
git clone https://github.com/your-username/ganttxa.git
cd ganttxa
```

#### 4. 创建生产环境配置

创建 `docker-compose.prod.yml`：

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    container_name: ganttxa-postgres
    restart: always
    environment:
      POSTGRES_DB: ganttxa
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - ganttxa-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: ganttxa-redis
    restart: always
    volumes:
      - redis_data:/data
    networks:
      - ganttxa-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: ganttxa-backend
    restart: always
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/ganttxa
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      CORS_ORIGIN: ${FRONTEND_URL}
    volumes:
      - ./backend/uploads:/app/uploads
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - ganttxa-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
      args:
        VITE_API_URL: ${BACKEND_URL}
    container_name: ganttxa-frontend
    restart: always
    depends_on:
      - backend
    networks:
      - ganttxa-network

  nginx:
    image: nginx:alpine
    container_name: ganttxa-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    networks:
      - ganttxa-network

volumes:
  postgres_data:
  redis_data:

networks:
  ganttxa-network:
    driver: bridge
```

#### 5. 创建环境变量文件

创建 `.env.prod`：

```bash
# 数据库配置
DB_USER=ganttxa_user
DB_PASSWORD=your_strong_password_here

# JWT 密钥（使用随机字符串）
JWT_SECRET=your_jwt_secret_here_min_32_chars

# URL 配置
FRONTEND_URL=https://your-domain.com
BACKEND_URL=https://api.your-domain.com

# 其他配置
NODE_ENV=production
```

生成强密码：
```bash
# 生成 JWT_SECRET
openssl rand -base64 32

# 生成数据库密码
openssl rand -base64 24
```

#### 6. 创建生产环境 Dockerfile

**backend/Dockerfile.prod**：
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

RUN mkdir -p uploads

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

**frontend/Dockerfile.prod**：
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**frontend/nginx.conf**：
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

#### 7. 创建 Nginx 配置

创建 `nginx/nginx.conf`：

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:3000;
    }

    upstream frontend {
        server frontend:80;
    }

    # HTTP 重定向到 HTTPS（如果有 SSL）
    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS 配置
    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        # 前端
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # 后端 API
        location /api {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # WebSocket 支持
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }

        # 文件上传大小限制
        client_max_body_size 50M;
    }
}
```

#### 8. 启动服务

```bash
# 使用生产环境配置启动
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 检查服务状态
docker-compose -f docker-compose.prod.yml ps
```

#### 9. 初始化数据库

```bash
# 进入 postgres 容器
docker exec -it ganttxa-postgres psql -U ganttxa_user -d ganttxa

# 或者从外部执行
docker exec -i ganttxa-postgres psql -U ganttxa_user -d ganttxa < database/init.sql
```

#### 10. 验证部署

```bash
# 检查后端健康
curl http://localhost:3000/health

# 检查前端
curl http://localhost
```

---

## 方式二：云服务器手动部署

### 适用场景
- 需要更细粒度的控制
- 不想使用 Docker
- 已有 Nginx 等服务

### 步骤

#### 1. 安装 Node.js

```bash
# 使用 nvm 安装
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

#### 2. 安装 PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# 创建数据库和用户
sudo -u postgres psql
CREATE DATABASE ganttxa;
CREATE USER ganttxa_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ganttxa TO ganttxa_user;
\q
```

#### 3. 安装 Redis

```bash
sudo apt install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

#### 4. 部署后端

```bash
cd /opt
git clone https://github.com/your-username/ganttxa.git
cd ganttxa/backend

# 安装依赖
npm ci --only=production

# 配置环境变量
cp .env.example .env
nano .env  # 编辑配置

# 构建
npm run build

# 使用 PM2 管理进程
npm install -g pm2
pm2 start dist/index.js --name ganttxa-backend
pm2 save
pm2 startup
```

#### 5. 部署前端

```bash
cd /opt/ganttxa/frontend

# 安装依赖
npm ci

# 构建
npm run build

# 将构建产物复制到 Nginx 目录
sudo cp -r dist/* /var/www/ganttxa/
```

#### 6. 配置 Nginx

```bash
sudo nano /etc/nginx/sites-available/ganttxa
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/ganttxa;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    client_max_body_size 50M;
}
```

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/ganttxa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 方式三：Vercel + Railway 部署

### 优点
- 完全免费（小规模使用）
- 自动 HTTPS
- 全球 CDN
- 零运维

### 步骤

#### 1. 部署后端到 Railway

1. 访问 [Railway.app](https://railway.app)
2. 使用 GitHub 登录
3. 点击 "New Project" → "Deploy from GitHub repo"
4. 选择你的 ganttxa 仓库
5. 选择 `backend` 目录
6. 添加 PostgreSQL 和 Redis 服务
7. 配置环境变量：
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   JWT_SECRET=your_jwt_secret
   CORS_ORIGIN=https://your-app.vercel.app
   ```
8. 部署完成后获取后端 URL

#### 2. 部署前端到 Vercel

1. 访问 [Vercel.com](https://vercel.com)
2. 使用 GitHub 登录
3. 点击 "New Project"
4. 选择你的 ganttxa 仓库
5. 配置：
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. 环境变量：
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```
7. 部署

#### 3. 配置自定义域名（可选）

在 Vercel 和 Railway 的设置中添加自定义域名。

---

## 环境变量配置

### 后端环境变量 (.env)

```bash
# 应用配置
NODE_ENV=production
PORT=3000

# 数据库
DATABASE_URL=postgresql://user:password@host:5432/ganttxa

# Redis
REDIS_URL=redis://host:6379

# JWT
JWT_SECRET=your_jwt_secret_min_32_characters

# CORS
CORS_ORIGIN=https://your-domain.com

# 文件上传
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800  # 50MB

# 可选：AI API（如果需要服务端 AI 功能）
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENROUTER_API_KEY=sk-or-v1-...
```

### 前端环境变量 (.env.production)

```bash
VITE_API_URL=https://api.your-domain.com
```

---

## 域名和 HTTPS 配置

### 使用 Let's Encrypt 免费 SSL

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

### 配置 SSL 到 Docker

```bash
# 复制证书到项目目录
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/

# 重启 Nginx 容器
docker-compose -f docker-compose.prod.yml restart nginx
```

---

## 监控和维护

### 1. 日志管理

```bash
# Docker 日志
docker-compose -f docker-compose.prod.yml logs -f --tail=100

# PM2 日志
pm2 logs ganttxa-backend

# Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 2. 备份数据库

```bash
# 创建备份脚本
cat > /opt/backup-ganttxa.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups/ganttxa"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 备份数据库
docker exec ganttxa-postgres pg_dump -U ganttxa_user ganttxa > $BACKUP_DIR/db_$DATE.sql

# 备份上传文件
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /opt/ganttxa/backend/uploads

# 删除 7 天前的备份
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /opt/backup-ganttxa.sh

# 添加到 crontab（每天凌晨 2 点备份）
crontab -e
# 添加：0 2 * * * /opt/backup-ganttxa.sh
```

### 3. 更新部署

```bash
cd /opt/ganttxa

# 拉取最新代码
git pull origin main

# 重新构建并启动
docker-compose -f docker-compose.prod.yml up -d --build

# 或者使用 PM2
cd backend
npm run build
pm2 restart ganttxa-backend
```

### 4. 性能监控

推荐工具：
- **Uptime Kuma**：服务可用性监控
- **Grafana + Prometheus**：性能指标
- **Sentry**：错误追踪

---

## 安全建议

1. **防火墙配置**
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

2. **定期更新**
```bash
sudo apt update && sudo apt upgrade -y
```

3. **使用强密码**
- 数据库密码至少 16 位
- JWT Secret 至少 32 位
- 定期轮换密钥

4. **限制数据库访问**
- 只允许本地或内网访问
- 使用防火墙规则限制

5. **启用速率限制**
- 在 Nginx 中配置请求限制
- 防止 DDoS 攻击

---

## 故障排查

### 后端无法启动
```bash
# 检查日志
docker logs ganttxa-backend

# 检查数据库连接
docker exec -it ganttxa-postgres psql -U ganttxa_user -d ganttxa
```

### 前端无法访问
```bash
# 检查 Nginx 配置
nginx -t

# 检查端口占用
netstat -tulpn | grep :80
```

### 数据库连接失败
```bash
# 检查 PostgreSQL 状态
docker exec -it ganttxa-postgres pg_isready

# 检查连接字符串
echo $DATABASE_URL
```

---

## 成本估算

### 自建服务器（阿里云/腾讯云）
- 2核4G服务器：¥100-200/月
- 域名：¥50-100/年
- SSL证书：免费（Let's Encrypt）
- **总计**：约 ¥1500-2500/年

### Vercel + Railway
- Vercel：免费（个人项目）
- Railway：$5-20/月（根据使用量）
- **总计**：约 $60-240/年

---

## 下一步

部署完成后：
1. 配置域名和 SSL
2. 设置自动备份
3. 配置监控告警
4. 进行压力测试
5. 编写运维文档

需要帮助？查看 [故障排查文档](TROUBLESHOOTING.md) 或提交 Issue。
