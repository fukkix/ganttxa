# GanttXa 快速部署参考

**5 分钟部署到腾讯云**

---

## 📋 前置要求

- 腾讯云服务器（Ubuntu/CentOS）
- 已安装 Docker 和 Docker Compose
- 服务器 IP 或域名

---

## 🚀 快速命令

### 1. 服务器准备

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 安装 Docker Compose
apt install docker-compose nginx -y

# 启动 Docker
systemctl start docker && systemctl enable docker
```

### 2. 部署项目

```bash
# 克隆项目
cd /opt/projects
git clone https://github.com/fukkix/ganttxa.git
cd ganttxa

# 配置环境变量
cp .env.prod.example .env.prod
nano .env.prod  # 修改密码和密钥

# 构建和启动
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

### 3. 配置访问

**方案 A: 使用 IP + 端口（最简单）**

```bash
# 开放端口
ufw allow 8080/tcp
ufw allow 3000/tcp
ufw enable

# 访问地址
# 前端: http://your-ip:8080
# 后端: http://your-ip:3000
```

**方案 B: 使用域名 + Nginx**

```bash
# 创建 Nginx 配置
cat > /etc/nginx/sites-available/ganttxa << 'EOF'
server {
    listen 80;
    server_name ganttxa.yourdomain.com;
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name api.ganttxa.yourdomain.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
EOF

# 启用配置
ln -s /etc/nginx/sites-available/ganttxa /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

# 访问地址
# 前端: http://ganttxa.yourdomain.com
# 后端: http://api.ganttxa.yourdomain.com
```

---

## 🔄 更新部署

```bash
cd /opt/projects/ganttxa
./deploy.sh
```

---

## 📊 常用命令

```bash
# 查看状态
docker-compose -f docker-compose.prod.yml ps

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 重启服务
docker-compose -f docker-compose.prod.yml restart

# 停止服务
docker-compose -f docker-compose.prod.yml down
```

---

## 🔒 配置 HTTPS

```bash
# 安装 Certbot
apt install certbot python3-certbot-nginx -y

# 申请证书
certbot --nginx -d ganttxa.yourdomain.com -d api.ganttxa.yourdomain.com
```

---

## 📝 环境变量模板

```bash
# .env.prod
DB_PASSWORD=your_secure_password_123
JWT_SECRET=your_jwt_secret_at_least_32_chars
CORS_ORIGIN=https://ganttxa.yourdomain.com
VITE_API_URL=https://api.ganttxa.yourdomain.com
```

---

## 🎯 端口分配（多项目）

| 项目 | 前端端口 | 后端端口 |
|------|---------|---------|
| GanttXa | 8080 | 3000 |
| 项目 2 | 8081 | 3001 |
| 项目 3 | 8082 | 3002 |

---

## 📚 详细文档

- [完整部署指南](部署指南-腾讯云.md)
- [英文部署指南](DEPLOYMENT-GUIDE-CLOUD.md)

