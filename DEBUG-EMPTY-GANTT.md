# 甘特图空白问题调试指南

## 问题描述
任务已成功导入，没有"待确认"警告，但甘特图仍然显示空白。

## 已修复的问题

### 1. 变量作用域问题
**问题**：`WARNING_BAR_HEIGHT` 在定义之前就被使用
**修复**：将变量定义移到使用之前

### 2. 数据类型不一致
**问题**：
- AI 解析返回空字符串 `''`
- 数据库模型要求 `YYYY-MM-DD` 格式或 null
- 前端过滤逻辑检查 `!t.startDate`（空字符串会通过检查）

**修复**：
- 后端：将空字符串转换为 `null`
- 数据库模型：允许 `startDate` 为 `null`
- 前端类型：`startDate: string | null`

### 3. 添加调试日志
在 GanttChart 组件中添加详细日志，输出：
- 总任务数
- 有日期任务数
- 无日期任务数
- 每个任务的日期信息

## 调试步骤

### 1. 重启后端服务
```bash
cd backend
npm run dev
```

### 2. 清除浏览器缓存
- F12 打开开发者工具
- 右键刷新按钮 → "清空缓存并硬性重新加载"

### 3. 重新导入任务
1. 删除当前项目（如果有）
2. 重新上传 Excel 文件
3. 使用 Claude Sonnet 4.6 进行解析
4. 完成字段映射
5. 导入任务

### 4. 查看控制台日志

#### 前端日志（浏览器控制台）
```javascript
🎨 [GanttChart] 任务统计: {
  总任务数: 10,
  有日期任务: 10,  // 应该是 10，不是 0
  无日期任务: 0,   // 应该是 0
  任务列表: [
    {
      name: "部署相关资源准备",
      startDate: "2026-04-15",  // 应该有值，不是 null
      hasStartDate: true,
      startDateType: "string",
      startDateLength: 10
    },
    ...
  ]
}
```

#### 后端日志（终端）
```
🔍 [DEBUG] 任务 1: {
  name: '部署相关资源准备',
  startDate: '2026-04-15',  // 应该有值
  endDate: '2026-04-30',
  assignee: '学会',
  phase: '部署前资源准备阶段'
}
```

## 预期结果

### 如果日期正确解析
- 前端日志显示 10 个有日期任务
- 甘特图正常显示任务条
- 时间轴从 4月15日 到 5月底

### 如果日期仍然为 null
- 前端日志显示 10 个无日期任务
- 甘特图显示警告提示
- 需要检查 AI 解析结果

## 可能的问题和解决方案

### 问题 1：所有任务的 startDate 都是 null

**原因**：AI 没有正确解析日期

**检查**：
1. 查看后端日志中的 AI 原始响应
2. 确认使用的是 Claude Sonnet 4.6
3. 检查 API Key 是否有效

**解决方案**：
```bash
# 查看后端日志
cd backend
npm run dev

# 重新上传文件，观察日志输出
```

### 问题 2：部分任务有日期，部分没有

**原因**：表格中某些任务的日期列为空或 `-`

**预期行为**：
- 有日期的任务正常显示
- 无日期的任务显示警告标记
- 顶部显示统计信息

**操作**：
- 手动编辑无日期的任务
- 添加开始日期

### 问题 3：日期格式错误

**症状**：
- 后端日志显示日期，但格式不是 `YYYY-MM-DD`
- 数据库验证失败

**检查**：
```javascript
// 后端日志应该显示
startDate: '2026-04-15'  // ✅ 正确
startDate: '4/15/26'     // ❌ 错误
startDate: '2026/04/15'  // ❌ 错误
```

**解决方案**：
- 确认 AI prompt 中的日期格式要求
- 可能需要添加后端日期格式转换

### 问题 4：数据库中有数据，但前端显示为空

**检查**：
1. 打开浏览器网络面板
2. 查看 `/api/projects/:id` 的响应
3. 确认 tasks 数组中的数据

**可能原因**：
- API 响应格式错误
- 前端状态管理问题
- 数据序列化问题

## 数据流追踪

### 1. AI 解析
```
Excel 文件 → AI API → JSON 响应
```
检查点：后端日志 `🔍 [DEBUG] 任务 1:`

### 2. 数据验证
```
JSON → Zod 验证 → 数据库
```
检查点：是否有验证错误

### 3. 数据库存储
```
INSERT INTO tasks → 返回 task 对象
```
检查点：数据库中的 start_date 字段

### 4. API 响应
```
数据库 → mapTaskFromDb → JSON 响应
```
检查点：网络面板中的响应数据

### 5. 前端渲染
```
API 响应 → Zustand store → GanttChart 组件
```
检查点：浏览器控制台日志

## 快速诊断命令

### 检查数据库中的任务
```sql
-- 连接到数据库
psql -U ganttflow_user -d ganttflow_db

-- 查看任务数据
SELECT id, name, start_date, end_date, phase 
FROM tasks 
ORDER BY created_at DESC 
LIMIT 10;

-- 检查是否有 null 日期
SELECT COUNT(*) as null_dates 
FROM tasks 
WHERE start_date IS NULL;
```

### 检查 API 响应
```bash
# 获取项目 ID（从浏览器 URL 或控制台）
PROJECT_ID="your-project-id"

# 测试 API
curl http://localhost:3000/api/projects/$PROJECT_ID
```

## 成功标志

✅ 后端日志显示正确的日期格式
✅ 前端日志显示 10 个有日期任务
✅ 甘特图显示任务条
✅ 时间轴显示正确的日期范围
✅ 可以拖动和缩放甘特图

## 如果问题仍然存在

请提供以下信息：
1. 后端完整日志（从文件上传到任务创建）
2. 前端控制台日志（GanttChart 任务统计）
3. 网络面板中的 API 响应
4. 使用的 AI 模型和提供商
5. Excel 文件的截图或示例数据

这将帮助我们进一步诊断问题。
