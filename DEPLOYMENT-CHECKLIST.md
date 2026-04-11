# GanttXa 部署清单

## 快速开始（5分钟部署）

### 选项 1：使用 Vercel + Railway（推荐新手）

**成本**：免费 - $10/月  
**时间**：5-10 分钟  
**难度**：⭐

#### 步骤：

1. **部署后端到 Railway**
   - [ ] 访问 https://railway.app
   - [ ] 连接 GitHub 仓库
   - [ ] 添加 PostgreSQL 服务
   - [ ] 添加 Redis 服务
   - [ ] 配置环境变量（见下方）
   - [ ] 获取后端 URL

2. **部署前端到 Vercel**
   - [ ] 访问 https://vercel.com
   - [ ] 连接 GitHub 仓库
   - [ ] 设置 Root Directory 为 `frontend`
   - [ ] 配置环境变量：`VITE_API_URL=你的Railway后端URL`
   - [ ] 部署

3. **完成**
   - [ ] 访问 Vercel 提供的 URL
   - [ ] 测试注册和登录
   - [ ] 测试 AI 解析功能

---

### 选项 2：使用 Docker Compose（推荐有服务器）

**成本**：$5-20/月（服务器费用）  
**时间**：15-30 分钟  
**难度**：⭐⭐

#### 前置要求：
- [ ] 一台云服务器（2核4G以上）
- [ ] 已安装 Docker 和 Docker Compose
- [ ] 域名（可选）

#### 步骤：

1. **准备服务器**
   ```bash
   # SSH 连接到服务器
   ssh root@your-server-ip
   
   # 安装 Docker（如果未安装）
   curl -fsSL https://get.docker.com | sh
   
   # 安装 Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **克隆项目**
   ```bash
   cd /opt
   git clone https://github.com/your-username/ganttxa.git
   cd ganttxa
   ```

3. **配置环境变量**
   ```bash
   # 复制示例文件
   cp .env.example .env.production
   
   # 编辑配置
   nano .env.production
   ```
   
   填写以下内容：
   ```bash
   DB_USER=ganttxa_user
   DB_PASSWORD=生成的强密码
   JWT_SECRET=生成的32位密钥
   FRONTEND_URL=https://your-domain.com
   BACKEND_URL=https://api.your-domain.com
   ```
   
   生成密钥：
   ```bash
   # 生成数据库密码
   openssl rand -base64 24
   
   # 生成 JWT Secret
   openssl rand -base64 32
   ```

4. **创建生产环境配置**
   - [ ] 创建 `docker-compose.prod.yml`（见 DEPLOYMENT-GUIDE.md）
   - [ ] 创建 `backend/Dockerfile.prod`
   - [ ] 创建 `frontend/Dockerfile.prod`
   - [ ] 创建 `nginx/nginx.conf`

5. **启动服务**
   ```bash
   # 使用部署脚本
   chmod +x deploy.sh
   ./deploy.sh production
   
   # 或手动启动
   docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
   ```

6. **配置域名和 SSL**
   ```bash
   # 安装 Certbot
   sudo apt install certbot python3-certbot-nginx
   
   # 获取 SSL 证书
   sudo certbot --nginx -d your-domain.com
   ```

7. **验证部署**
   - [ ] 访问 https://your-domain.com
   - [ ] 测试注册功能
   - [ ] 测试创建项目
   - [ ] 测试 AI 解析

---

## 环境变量配置

### 后端必需变量

```bash
# 数据库
DATABASE_URL=postgresql://user:password@host:5432/ganttxa

# Redis
REDIS_URL=redis://host:6379

# JWT（至少32位）
JWT_SECRET=your_jwt_secret_here

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# 环境
NODE_ENV=production
PORT=3000
```

### 前端必需变量

```bash
# API 地址
VITE_API_URL=https://your-backend-domain.com
```

---

## 部署后检查清单

### 功能测试
- [ ] 用户注册和登录
- [ ] 创建项目
- [ ] 添加任务
- [ ] 编辑任务
- [ ] 删除任务
- [ ] 上传 Excel 文件
- [ ] AI 解析功能
- [ ] 导出 PDF
- [ ] 分享链接
- [ ] 评论功能

### 性能测试
- [ ] 页面加载速度 < 3秒
- [ ] API 响应时间 < 500ms
- [ ] 大文件上传（10MB+）
- [ ] 1000+ 任务渲染

### 安全检查
- [ ] HTTPS 已启用
- [ ] 数据库密码强度
- [ ] JWT Secret 强度
- [ ] CORS 配置正确
- [ ] 文件上传大小限制
- [ ] SQL 注入防护
- [ ] XSS 防护

### 监控设置
- [ ] 服务器监控（CPU、内存、磁盘）
- [ ] 应用日志收集
- [ ] 错误追踪（Sentry）
- [ ] 可用性监控（Uptime）
- [ ] 备份策略

---

## 常见问题

### Q: 部署后无法访问？
**A**: 检查防火墙设置
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
```

### Q: 数据库连接失败？
**A**: 检查数据库服务状态
```bash
docker-compose ps postgres
docker logs ganttxa-postgres
```

### Q: 前端显示 API 错误？
**A**: 检查 CORS 配置
- 确保后端 `CORS_ORIGIN` 设置正确
- 检查前端 `VITE_API_URL` 是否正确

### Q: SSL 证书问题？
**A**: 重新申请证书
```bash
sudo certbot renew --force-renewal
```

### Q: 如何更新部署？
**A**: 
```bash
cd /opt/ganttxa
git pull origin main
./deploy.sh production
```

---

## 推荐服务商

### 云服务器
- **阿里云**：新用户优惠，国内速度快
- **腾讯云**：价格实惠
- **DigitalOcean**：$5/月起，简单易用
- **Vultr**：全球节点多

### 域名注册
- **阿里云**：.com 约 ¥60/年
- **腾讯云**：.cn 约 ¥30/年
- **Namecheap**：国际域名便宜

### 免费部署平台
- **Vercel**：前端部署，免费额度充足
- **Railway**：后端部署，$5/月起
- **Render**：全栈部署，免费层可用
- **Fly.io**：全球边缘部署

---

## 成本对比

### 方案 1：Vercel + Railway
- Vercel: 免费
- Railway: $5-10/月
- 域名: $10/年
- **总计**: ~$70/年

### 方案 2：云服务器
- 服务器: $10-20/月
- 域名: $10/年
- **总计**: ~$130-250/年

### 方案 3：自建服务器
- 服务器: 一次性 $500+
- 电费: $5-10/月
- 域名: $10/年
- **总计**: 首年 $570+，之后 $70/年

---

## 下一步

部署完成后：

1. **配置备份**
   - 设置数据库自动备份
   - 备份上传文件
   - 定期测试恢复

2. **设置监控**
   - 安装 Uptime Kuma
   - 配置告警通知
   - 监控磁盘空间

3. **优化性能**
   - 启用 CDN
   - 配置缓存
   - 压缩静态资源

4. **安全加固**
   - 定期更新系统
   - 配置防火墙
   - 启用日志审计

---

## 获取帮助

- 📖 详细文档：[DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md)
- 🐛 问题反馈：[GitHub Issues](https://github.com/your-username/ganttxa/issues)
- 💬 社区讨论：[Discussions](https://github.com/your-username/ganttxa/discussions)

---

**祝部署顺利！** 🎉
