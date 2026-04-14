# GanttXa 本地开发指南（无 Docker）

**适用**: macOS 系统，不使用 Docker

---

## 📋 前置要求

### 必需软件

- **Node.js**: v18.20.8 或更高版本
- **PostgreSQL**: v15+
- **Git**: 最新版本

---

## 🚀 快速启动（10 分钟）

### 步骤 1: 安装 Node.js 18

你已经安装了 Node.js 18.20.8 ✅

验证：
```bash
node -v  # 应该显示 v18.20.8
npm -v   # 应该显示 npm 版本
```

---

### 步骤 2: 安装 PostgreSQL

#### 使用 Homebrew（推荐）

```bash
# 安装 Homebrew（如果还没有）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 PostgreSQL
brew install postgresql@15

# 启动 PostgreSQL 服务
brew services start postgresql@15

# 验证安装
psql --version
```

#### 或者下载安装包

访问: https://www.postgresql.org/download/macosx/

---

### 步骤 3: 创建数据库

```bash
# 连接到 PostgreSQL（默认用户）
psql postgres

# 在 psql 中执行以下命令：
CREATE DATABASE ganttxa;
CREATE USER ganttxa_user WITH PASSWORD 'ganttxa123';
GRANT ALL PRIVILEGES ON DATABASE ganttxa TO ganttxa_user;

# 退出
\q
```

---

### 步骤 4: 配置环境变量

#### 后端环境变量

```bash
cd gattxa/backend

# 创建 .env 文件
cat > .env << 'EOF'
PORT=3000
DATABASE_URL=postgresql://ganttxa_user:ganttxa123@localhost:5432/ganttxa
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long_for_development
CORS_ORIGIN=http://localhost:5173
EOF
```

#### 前端环境变量

```bash
cd gattxa/frontend

# 创建 .env 文件
cat > .env << 'EOF'
VITE_API_URL=http://localhost:3000
EOF
```

---

### 步骤 5: 初始化数据库

```bash
cd gattxa

# 运行初始化脚本
psql -U ganttxa_user -d ganttxa -f database/init.sql

# 运行所有迁移
psql -U ganttxa_user -d ganttxa -f database/migrations/001_add_comments_table.sql
psql -U ganttxa_user -d ganttxa -f database/migrations/002_add_comment_reads_table.sql
psql -U ganttxa_user -d ganttxa -f database/migrations/003_add_project_members_table.sql
psql -U ganttxa_user -d ganttxa -f database/migrations/004_add_version_to_tasks.sql
```

如果提示输入密码，输入: `ganttxa123`

---

### 步骤 6: 安装依赖

#### 后端

```bash
cd gattxa/backend
npm install
```

**预期**: 安装 355 个包，大约需要 1-2 分钟

#### 前端

```bash
cd gattxa/frontend
npm install
```

**预期**: 安装依赖，大约需要 1-2 分钟

---

### 步骤 7: 启动服务

#### 启动后端（终端 1）

```bash
cd gattxa/backend
npm run dev
```

**成功标志**:
```
✅ WebSocket 服务已初始化
🚀 Server running on http://localhost:3000
📝 Environment: development
📁 Upload directory: ./uploads
🔌 WebSocket ready
```

#### 启动前端（终端 2 - 新终端）

```bash
cd gattxa/frontend
npm run dev
```

**成功标志**:
```
VITE v5.4.21  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## ✅ 验证安装

### 1. 访问前端

打开浏览器访问: http://localhost:5173

应该看到 GanttXa 主页

### 2. 测试注册

1. 点击"注册"按钮
2. 填写信息：
   - 邮箱: test@example.com
   - 姓名: Test User
   - 密码: test123456
3. 点击注册

### 3. 测试登录

使用刚才注册的账号登录

### 4. 创建项目

1. 点击"创建项目"
2. 输入项目名称
3. 添加任务

### 5. 测试实时协作

1. 打开两个浏览器窗口（或使用隐身模式）
2. 都登录并打开同一项目
3. 在一个窗口创建任务
4. 另一个窗口应该实时显示新任务

---

## 🔧 常用命令

### PostgreSQL 管理

```bash
# 启动 PostgreSQL
brew services start postgresql@15

# 停止 PostgreSQL
brew services stop postgresql@15

# 重启 PostgreSQL
brew services restart postgresql@15

# 查看状态
brew services list

# 连接到数据库
psql -U ganttxa_user -d ganttxa

# 在 psql 中：
\dt              # 查看所有表
\d tasks         # 查看 tasks 表结构
SELECT * FROM tasks LIMIT 10;  # 查看数据
\q               # 退出
```

### 后端命令

```bash
cd gattxa/backend

# 开发模式（热重载）
npm run dev

# 构建
npm run build

# 生产模式
npm start
```

### 前端命令

```bash
cd gattxa/frontend

# 开发模式（热重载）
npm run dev

# 构建
npm run build

# 预览构建结果
npm run preview
```

---

## 🔍 故障排查

### 问题 1: PostgreSQL 连接失败

**错误**: `Error: connect ECONNREFUSED`

**解决**:
```bash
# 检查 PostgreSQL 是否运行
brew services list | grep postgresql

# 如果没有运行，启动它
brew services start postgresql@15

# 测试连接
psql -U ganttxa_user -d ganttxa -c "SELECT 1"
```

### 问题 2: 数据库不存在

**错误**: `database "ganttxa" does not exist`

**解决**:
```bash
# 重新创建数据库
psql postgres << EOF
CREATE DATABASE ganttxa;
CREATE USER ganttxa_user WITH PASSWORD 'ganttxa123';
GRANT ALL PRIVILEGES ON DATABASE ganttxa TO ganttxa_user;
EOF
```

### 问题 3: 权限不足

**错误**: `permission denied for table`

**解决**:
```bash
# 连接到数据库
psql -U ganttxa_user -d ganttxa

# 授予权限
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ganttxa_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ganttxa_user;
\q
```

### 问题 4: 端口被占用

**错误**: `Error: listen EADDRINUSE: address already in use :::3000`

**解决**:
```bash
# 查找占用端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>

# 或使用不同端口
PORT=3001 npm run dev
```

### 问题 5: npm install 失败

**错误**: 各种安装错误

**解决**:
```bash
# 清理缓存
npm cache clean --force

# 删除 node_modules
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### 问题 6: 数据库迁移失败

**错误**: 迁移脚本执行失败

**解决**:
```bash
# 检查数据库连接
psql -U ganttxa_user -d ganttxa -c "SELECT version()"

# 手动运行每个迁移
cd gattxa
psql -U ganttxa_user -d ganttxa -f database/init.sql
psql -U ganttxa_user -d ganttxa -f database/migrations/001_add_comments_table.sql
# ... 依次运行其他迁移

# 如果某个迁移已经运行过，会报错但不影响
```

---

## 📊 开发工作流

### 每天开始工作

```bash
# 1. 确保 PostgreSQL 运行
brew services list | grep postgresql

# 2. 拉取最新代码
cd gattxa
git pull origin main

# 3. 启动后端（终端 1）
cd backend
npm run dev

# 4. 启动前端（终端 2）
cd frontend
npm run dev

# 5. 打开浏览器
open http://localhost:5173
```

### 结束工作

```bash
# 1. 提交代码
git add .
git commit -m "chore: 保存工作进度"
git push

# 2. 停止服务
# 在两个终端按 Ctrl+C

# 3. 停止数据库（可选）
brew services stop postgresql@15
```

---

## 💡 提示

### 数据库备份

```bash
# 备份数据库
pg_dump -U ganttxa_user ganttxa > backup.sql

# 恢复数据库
psql -U ganttxa_user -d ganttxa < backup.sql
```

### 重置数据库

```bash
# 删除并重新创建数据库
psql postgres << EOF
DROP DATABASE IF EXISTS ganttxa;
CREATE DATABASE ganttxa;
GRANT ALL PRIVILEGES ON DATABASE ganttxa TO ganttxa_user;
EOF

# 重新初始化
cd gattxa
psql -U ganttxa_user -d ganttxa -f database/init.sql
# 运行所有迁移...
```

### 查看日志

```bash
# 后端日志
# 直接在终端查看

# PostgreSQL 日志
tail -f /opt/homebrew/var/log/postgresql@15.log
```

---

## 🎯 快速命令参考

```bash
# 一键启动所有服务（创建脚本）
cat > start-dev.sh << 'EOF'
#!/bin/bash
echo "🚀 启动 GanttXa 开发环境..."

# 启动 PostgreSQL
brew services start postgresql@15

# 启动后端（后台）
cd backend
npm run dev &
BACKEND_PID=$!

# 等待后端启动
sleep 5

# 启动前端
cd ../frontend
npm run dev

# 清理
kill $BACKEND_PID
EOF

chmod +x start-dev.sh
./start-dev.sh
```

---

## 📚 相关文档

- [本地开发指南.md](本地开发指南.md) - 使用 Docker 的版本
- [README.md](README.md) - 项目介绍
- [docs/SETUP.md](docs/SETUP.md) - 详细环境搭建

---

## 🎉 开始开发！

现在你已经成功启动了 GanttXa 本地开发环境（无 Docker）！

**访问地址**:
- 前端: http://localhost:5173
- 后端: http://localhost:3000
- 数据库: localhost:5432

**下一步**:
1. 注册账号
2. 创建项目
3. 添加任务
4. 测试实时协作

祝开发愉快！🚀

---

**文档版本**: 1.0  
**最后更新**: 2026-04-13  
**适用系统**: macOS（无 Docker）

