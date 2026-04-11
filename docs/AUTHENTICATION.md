# GanttXa 认证系统详解

本文档详细说明 GanttXa 的用户认证系统实现。

## 目录

- [架构概览](#架构概览)
- [注册流程](#注册流程)
- [登录流程](#登录流程)
- [认证中间件](#认证中间件)
- [安全措施](#安全措施)
- [前端实现](#前端实现)
- [API 接口](#api-接口)

---

## 架构概览

### 技术栈

**后端**
- JWT (JSON Web Token) - 无状态认证
- bcrypt - 密码加密
- PostgreSQL - 用户数据存储
- Express 中间件 - 请求认证

**前端**
- localStorage - Token 存储
- Axios - HTTP 请求
- React Router - 路由保护

### 认证流程图

```
┌─────────┐      注册/登录      ┌─────────┐
│  前端   │ ──────────────────> │  后端   │
│         │                     │         │
│         │ <────── JWT ─────── │         │
└─────────┘                     └─────────┘
     │                               │
     │ 存储 Token                    │ 验证密码
     │ localStorage                  │ 生成 JWT
     │                               │
     │      携带 Token 请求          │
     │ ──────────────────────────> │
     │                               │
     │ <────── 响应数据 ─────────── │
     │                               │
```

---

## 注册流程

### 1. 前端提交

**RegisterPage.tsx**

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError('')
  setLoading(true)

  try {
    // 调用注册 API
    await register(email, password, displayName)
    // 注册成功，跳转首页
    navigate('/')
  } catch (err: any) {
    // 显示错误信息
    setError(err.response?.data?.error?.message || '注册失败，请重试')
  } finally {
    setLoading(false)
  }
}
```

### 2. API 调用

**frontend/src/api/auth.ts**

```typescript
export async function register(
  email: string,
  password: string,
  displayName?: string
): Promise<AuthResponse> {
  // 发送 POST 请求到后端
  const response = await axios.post(`${API_URL}/api/auth/register`, {
    email,
    password,
    displayName,
  })
  
  // 保存 token 到 localStorage
  localStorage.setItem('token', response.data.data.token)
  localStorage.setItem('user', JSON.stringify(response.data.data.user))
  
  return response.data.data
}
```

### 3. 后端处理

**backend/src/routes/auth.ts**

```typescript
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body

    // 1. 验证输入
    if (!email || !password) {
      throw createError('邮箱和密码不能为空', 400)
    }

    if (password.length < 6) {
      throw createError('密码长度至少为 6 位', 400)
    }

    // 2. 检查用户是否已存在
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      throw createError('邮箱已被注册', 400)
    }

    // 3. 加密密码（使用 bcrypt）
    const passwordHash = await bcrypt.hash(password, 10)

    // 4. 创建用户
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, display_name)
       VALUES ($1, $2, $3)
       RETURNING id, email, display_name, created_at`,
      [email, passwordHash, displayName || email.split('@')[0]]
    )

    const user = result.rows[0]

    // 5. 生成 JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    // 6. 返回用户信息和 token
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.display_name
        },
        token
      }
    })
  } catch (error) {
    next(error)
  }
})
```

### 4. 数据库存储

**users 表结构**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 登录流程

### 1. 前端提交

**LoginPage.tsx**

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError('')
  setLoading(true)

  try {
    // 调用登录 API
    await login(email, password)
    // 登录成功，跳转首页
    navigate('/')
  } catch (err: any) {
    // 显示错误信息
    setError(err.response?.data?.error?.message || '登录失败，请重试')
  } finally {
    setLoading(false)
  }
}
```

### 2. API 调用

**frontend/src/api/auth.ts**

```typescript
export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  // 发送 POST 请求到后端
  const response = await axios.post(`${API_URL}/api/auth/login`, {
    email,
    password,
  })
  
  // 保存 token 到 localStorage
  localStorage.setItem('token', response.data.data.token)
  localStorage.setItem('user', JSON.stringify(response.data.data.user))
  
  return response.data.data
}
```

### 3. 后端验证

**backend/src/routes/auth.ts**

```typescript
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body

    // 1. 验证输入
    if (!email || !password) {
      throw createError('邮箱和密码不能为空', 400)
    }

    // 2. 查找用户
    const result = await pool.query(
      'SELECT id, email, password_hash, display_name FROM users WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      throw createError('邮箱或密码错误', 401)
    }

    const user = result.rows[0]

    // 3. 验证密码（使用 bcrypt.compare）
    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      throw createError('邮箱或密码错误', 401)
    }

    // 4. 生成 JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    // 5. 返回用户信息和 token
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.display_name
        },
        token
      }
    })
  } catch (error) {
    next(error)
  }
})
```

---

## 认证中间件

### 后端中间件

**backend/src/middleware/auth.ts**

```typescript
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { createError } from './errorHandler.js'

export interface AuthRequest extends Request {
  userId?: string
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. 从请求头获取 token
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      throw createError('未提供认证令牌', 401)
    }

    // 2. 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
    }

    // 3. 将用户 ID 添加到请求对象
    req.userId = decoded.userId

    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(createError('无效的认证令牌', 401))
    } else if (error instanceof jwt.TokenExpiredError) {
      next(createError('认证令牌已过期', 401))
    } else {
      next(error)
    }
  }
}
```

### 使用中间件

```typescript
// 保护需要认证的路由
router.get('/projects', authenticate, async (req: AuthRequest, res) => {
  const userId = req.userId // 从中间件获取用户 ID
  // 查询用户的项目...
})
```

### 前端请求拦截器

**frontend/src/api/projects.ts**

```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: API_BASE_URL,
})

// 添加请求拦截器（自动添加 token）
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 添加响应拦截器（处理认证错误）
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token 过期或无效，跳转到登录页
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

---

## 安全措施

### 1. 密码加密

使用 bcrypt 进行密码哈希：

```typescript
// 注册时加密
const passwordHash = await bcrypt.hash(password, 10)

// 登录时验证
const isValid = await bcrypt.compare(password, user.password_hash)
```

**特点**：
- 单向加密（不可逆）
- 自动加盐（salt）
- 计算成本可调（10 轮）

### 2. JWT Token

**Token 结构**：

```
Header.Payload.Signature
```

**Payload 内容**：

```json
{
  "userId": "uuid",
  "iat": 1234567890,
  "exp": 1234567890
}
```

**优点**：
- 无状态（不需要服务器存储）
- 可扩展（可添加自定义字段）
- 跨域支持

### 3. HTTPS

生产环境必须使用 HTTPS：
- 防止中间人攻击
- 保护 Token 传输
- 保护用户密码

### 4. CORS 配置

```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))
```

### 5. 输入验证

```typescript
// 邮箱格式验证
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailRegex.test(email)) {
  throw createError('邮箱格式不正确', 400)
}

// 密码强度验证
if (password.length < 6) {
  throw createError('密码长度至少为 6 位', 400)
}
```

### 6. SQL 注入防护

使用参数化查询：

```typescript
// ✅ 安全：使用参数化查询
pool.query('SELECT * FROM users WHERE email = $1', [email])

// ❌ 危险：字符串拼接
pool.query(`SELECT * FROM users WHERE email = '${email}'`)
```

### 7. XSS 防护

- React 自动转义输出
- 使用 Content Security Policy
- 验证和清理用户输入

### 8. CSRF 防护

- 使用 JWT（存储在 localStorage）
- 验证 Origin 头
- 使用 SameSite Cookie（如果使用 Cookie）

---

## 前端实现

### 路由保护

**App.tsx**

```typescript
import { Navigate } from 'react-router-dom'
import { isAuthenticated } from './api/auth'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

// 使用
<Route path="/editor/:id" element={
  <ProtectedRoute>
    <EditorPage />
  </ProtectedRoute>
} />
```

### 用户状态管理

```typescript
// 检查登录状态
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token')
}

// 获取当前用户
export function getLocalUser(): User | null {
  const userStr = localStorage.getItem('user')
  if (!userStr) return null
  
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

// 登出
export function logout(): void {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}
```

### 自动登录

```typescript
useEffect(() => {
  // 页面加载时检查登录状态
  const token = localStorage.getItem('token')
  if (token) {
    // 验证 token 是否有效
    getCurrentUser()
      .then(user => setUser(user))
      .catch(() => {
        // Token 无效，清除并跳转登录
        logout()
        navigate('/login')
      })
  }
}, [])
```

---

## API 接口

### POST /api/auth/register

注册新用户

**请求体**：
```json
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "用户名"
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "displayName": "用户名"
    },
    "token": "jwt-token"
  }
}
```

### POST /api/auth/login

用户登录

**请求体**：
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "displayName": "用户名"
    },
    "token": "jwt-token"
  }
}
```

### GET /api/auth/me

获取当前用户信息

**请求头**：
```
Authorization: Bearer <token>
```

**响应**：
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "用户名",
    "createdAt": "2026-04-11T10:00:00Z"
  }
}
```

---

## 常见问题

### Q: Token 存储在哪里？

A: 存储在浏览器的 localStorage 中。

**优点**：
- 简单易用
- 跨标签页共享
- 不受 CSRF 攻击

**缺点**：
- 可能受 XSS 攻击
- 需要手动管理过期

### Q: Token 过期怎么办？

A: 
1. 后端返回 401 错误
2. 前端拦截器捕获错误
3. 清除本地 token
4. 跳转到登录页

### Q: 如何实现"记住我"功能？

A: 调整 JWT 过期时间：

```typescript
// 短期（默认）
expiresIn: '7d'

// 长期（记住我）
expiresIn: '30d'
```

### Q: 如何实现刷新 Token？

A: 实现 refresh token 机制：

1. 登录时返回 access token 和 refresh token
2. access token 短期（15分钟）
3. refresh token 长期（30天）
4. access token 过期时用 refresh token 获取新的

### Q: 密码忘记怎么办？

A: 实现密码重置功能：

1. 用户输入邮箱
2. 发送重置链接到邮箱
3. 链接包含临时 token
4. 用户点击链接设置新密码

---

## 最佳实践

1. **使用 HTTPS**：生产环境必须
2. **强密码策略**：至少 8 位，包含大小写字母和数字
3. **限制登录尝试**：防止暴力破解
4. **Token 过期时间**：平衡安全和用户体验
5. **日志记录**：记录登录失败和异常行为
6. **双因素认证**：增强安全性（可选）
7. **定期更新依赖**：修复安全漏洞

---

## 参考资源

- [JWT 官方文档](https://jwt.io/)
- [bcrypt 文档](https://github.com/kelektiv/node.bcrypt.js)
- [OWASP 认证指南](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

**文档版本**：v1.0  
**最后更新**：2026-04-11
