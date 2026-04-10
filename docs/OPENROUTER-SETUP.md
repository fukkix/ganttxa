# 使用 OpenRouter API 配置指南

GanttFlow 支持使用 OpenRouter 作为 AI API 提供商，这样你可以使用一个 API Key 访问多个 AI 模型。

## 为什么使用 OpenRouter？

- 💰 **更便宜**：通常比官方 API 更便宜
- 🔄 **多模型支持**：一个 API Key 访问多个模型
- 🌍 **更好的可用性**：在某些地区更容易访问
- 📊 **统一计费**：所有模型使用统一计费

## 配置步骤

### 1. 获取 OpenRouter API Key

1. 访问 https://openrouter.ai/
2. 注册/登录账户
3. 进入 Keys 页面：https://openrouter.ai/keys
4. 创建新的 API Key
5. 复制 API Key（格式：`sk-or-v1-xxxxx`）

### 2. 配置后端环境变量

编辑 `backend/.env` 文件：

```env
# 设置 API 提供商为 openrouter
API_PROVIDER=openrouter

# 填写你的 OpenRouter API Key
OPENROUTER_API_KEY=sk-or-v1-xxxxx

# 应用 URL（OpenRouter 需要用于统计）
APP_URL=http://localhost:5173

# 其他配置保持不变
DATABASE_URL=postgresql://postgres:password@localhost:5432/ganttflow
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=20971520
```

### 3. 重启后端服务

```powershell
# 停止当前运行的后端（Ctrl+C）
# 然后重新启动
npm run dev
```

## 可用的模型

OpenRouter 支持多个 Claude 模型，当前配置使用：

- **anthropic/claude-3.5-sonnet**（推荐）
  - 最新的 Claude 3.5 Sonnet 模型
  - 性能优秀，价格合理
  - 适合文件解析任务

### 切换模型

如果你想使用其他模型，编辑 `backend/src/services/aiParser.ts`：

```typescript
const model =
  API_PROVIDER === 'openrouter'
    ? 'anthropic/claude-3.5-sonnet'  // 修改这里
    : 'claude-sonnet-4-20250514'
```

可选模型：
- `anthropic/claude-3.5-sonnet` - Claude 3.5 Sonnet（推荐）
- `anthropic/claude-3-opus` - Claude 3 Opus（最强但最贵）
- `anthropic/claude-3-sonnet` - Claude 3 Sonnet
- `anthropic/claude-3-haiku` - Claude 3 Haiku（最快最便宜）

查看所有可用模型：https://openrouter.ai/models

## 价格对比

以 Claude 3.5 Sonnet 为例（2026年4月价格）：

| 提供商 | 输入价格 | 输出价格 |
|--------|----------|----------|
| Anthropic 官方 | $3/1M tokens | $15/1M tokens |
| OpenRouter | $3/1M tokens | $15/1M tokens |

*价格可能变动，请查看官方网站*

## 测试配置

启动后端后，访问健康检查端点：

```powershell
curl http://localhost:3000/health
```

然后尝试上传文件进行 AI 解析，检查是否正常工作。

## 故障排除

### 1. API Key 无效

**错误：** `Invalid API key`

**解决：**
- 检查 API Key 是否正确复制
- 确认 API Key 格式为 `sk-or-v1-xxxxx`
- 检查 OpenRouter 账户是否有余额

### 2. 模型不可用

**错误：** `Model not found`

**解决：**
- 检查模型名称是否正确
- 访问 https://openrouter.ai/models 查看可用模型
- 某些模型可能需要额外权限

### 3. 请求失败

**错误：** `Request failed`

**解决：**
- 检查网络连接
- 确认 OpenRouter 服务状态：https://status.openrouter.ai/
- 查看后端日志获取详细错误信息

### 4. 余额不足

**错误：** `Insufficient credits`

**解决：**
- 访问 https://openrouter.ai/credits 充值
- OpenRouter 支持多种支付方式

## 切换回 Anthropic 官方 API

如果你想切换回 Anthropic 官方 API：

1. 编辑 `backend/.env`：
```env
API_PROVIDER=anthropic
CLAUDE_API_KEY=sk-ant-api03-xxxxx
```

2. 重启后端服务

## 监控使用情况

OpenRouter 提供详细的使用统计：

1. 访问 https://openrouter.ai/activity
2. 查看每个请求的详细信息
3. 监控成本和使用量

## 最佳实践

1. **设置预算限制**：在 OpenRouter 设置每日/每月预算
2. **监控使用**：定期检查 API 使用情况
3. **选择合适的模型**：根据任务复杂度选择模型
4. **缓存结果**：对于相同的文件，可以缓存解析结果

## 参考链接

- OpenRouter 官网：https://openrouter.ai/
- OpenRouter 文档：https://openrouter.ai/docs
- 模型列表：https://openrouter.ai/models
- 价格对比：https://openrouter.ai/models?order=newest
- API 参考：https://openrouter.ai/docs#api-keys
