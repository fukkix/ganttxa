# 模型更新说明

## 更新内容

### 新增 Claude Sonnet 4.6 模型

已将 **Claude Sonnet 4.6** 添加到模型列表，并设为默认推荐模型。

### 为什么选择 Sonnet 4.6？

1. **最新发布**：2025年5月发布，是目前最先进的 Claude 模型
2. **智能程度更高**：对复杂格式的理解能力显著提升
3. **日期解析更准确**：能更好地识别 `4/15/26` 这类简写日期格式
4. **表格结构理解**：对 Excel 表格的层级结构理解更准确

### 模型列表

#### OpenRouter（推荐）
- 🔥 **Claude Sonnet 4.6** - 最新推荐
- Claude Sonnet 4
- Claude 3.5 Sonnet (Beta)
- Claude 3.5 Sonnet
- Claude 3 Opus
- Claude 3 Sonnet
- Claude 3 Haiku（快速）
- Gemini 2.0 Flash（免费）
- Gemini 1.5 Pro

#### Anthropic（官方）
- 🔥 **Claude Sonnet 4.6 (2025-05-14)** - 最新推荐
- Claude Sonnet 4 (2025-05-14)
- Claude 3.5 Sonnet (2024-10-22)
- Claude 3.5 Sonnet (2024-06-20)
- Claude 3 Opus
- Claude 3 Haiku（快速）

## 使用建议

### 日期解析任务
**强烈推荐使用 Claude Sonnet 4.6**

原因：
- 对 `M/D/YY` 格式的识别更准确
- 能正确处理两位数年份（26 → 2026）
- 对表格中的合并单元格理解更好
- 能识别 `-` 表示无结束日期

### 成本考虑
如果预算有限，可以选择：
- Claude 3 Haiku（快速且便宜）
- Gemini 2.0 Flash（OpenRouter 上免费）

但这些模型的日期解析准确率可能较低。

## 测试建议

1. **首选**：Claude Sonnet 4.6
2. **备选**：Claude Sonnet 4
3. **预算有限**：Claude 3.5 Sonnet

如果使用 Sonnet 4.6 后日期仍然解析不正确，可能需要：
- 检查 Excel 文件格式
- 查看后端日志中的 AI 原始响应
- 考虑添加后端日期格式后处理逻辑

## 如何切换模型

1. 打开 GanttXa 首页
2. 点击"AI 解析项目文件"
3. 点击"AI 设置"按钮
4. 在"模型选择"下拉框中选择 **Claude Sonnet 4.6**
5. 保存设置
6. 重新上传文件进行解析

## 预期效果

使用 Claude Sonnet 4.6 后，对于示例 Excel 文件：

### 之前（Sonnet 4 或更早）
- 可能无法识别 `4/15/26` 格式
- 日期字段为空
- 需要手动编辑每个任务

### 现在（Sonnet 4.6）
- 正确识别 `4/15/26` → `2026-04-15`
- 所有任务都有正确的日期
- 甘特图正常显示
- 无需手动编辑

## 注意事项

1. **API Key 要求**：确保你的 API Key 有权限访问 Sonnet 4.6
2. **配额限制**：Sonnet 4.6 可能有使用限制，注意配额
3. **成本**：Sonnet 4.6 的成本可能略高于旧版本
4. **可用性**：如果 4.6 不可用，会自动降级到 4.0

## 技术细节

### 模型标识符

#### OpenRouter
```
anthropic/claude-sonnet-4.6
```

#### Anthropic 官方
```
claude-sonnet-4.6-20250514
```

### API 调用示例

```typescript
// OpenRouter
{
  model: 'anthropic/claude-sonnet-4.6',
  messages: [...]
}

// Anthropic
{
  model: 'claude-sonnet-4.6-20250514',
  messages: [...]
}
```

## 反馈

如果使用 Claude Sonnet 4.6 后：
- ✅ 日期解析正确：太好了！
- ❌ 日期仍然错误：请查看后端日志，可能需要进一步优化 prompt
- ⚠️ 模型不可用：降级使用 Sonnet 4 或 3.5 Sonnet

请在测试后反馈结果，以便我们继续优化。
