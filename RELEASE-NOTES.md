# GanttXa 版本发布说明

## v0.3.0 - 2026-04-11

### 🎉 新增功能

#### 任务拖拽排序
- 支持拖拽调整任务顺序
- 拖动时视觉反馈（半透明 + 目标高亮）
- 支持跨阶段拖拽
- 自动保存新顺序

#### 项目名称编辑
- 点击编辑图标进入编辑模式
- 支持 Enter 保存、Esc 取消
- 实时保存到服务器
- 悬停显示编辑按钮

#### 自动保存机制
- 编辑后 30 秒自动保存
- 保存状态实时显示
- 仅对已创建项目生效

#### 甘特图控制增强
- 缩放控制（50%-300%）
- 时间粒度切换（日/周/月）
- 今天按钮（跳转当前日期）
- 周末显示开关
- 节假日显示开关

### 🎨 UI/UX 改进

- 完整应用 Material Design 3 设计系统
- TaskList 组件视觉优化
- GanttControls 组件重新设计
- 拖拽手柄和视觉反馈
- 加载和错误状态优化

### 📚 文档更新

- 新增快速开始指南（QUICKSTART.md）
- 新增功能说明文档（docs/FEATURES.md）
- 更新开发进度报告
- 完善 README 文档结构

### 🐛 Bug 修复

- 修复项目加载时的状态同步问题
- 修复任务删除后的状态更新
- 优化自动保存的防抖逻辑

### ⚡ 性能优化

- 优化任务列表渲染性能
- 减少不必要的状态更新
- 改进拖拽操作的流畅度

---

## v0.2.0 - 2026-04-11

### 🎉 新增功能

#### AI 文件解析（用户提供 API Key）
- 支持 Anthropic 和 OpenRouter 两种提供商
- 本地存储 API Key，保护隐私
- 支持多种 Claude 模型选择
- AI 设置对话框

#### 文件上传和解析流程
- 拖拽上传文件
- 支持 Excel、Word、CSV 格式
- 解析进度显示
- 字段映射确认界面

#### 项目管理完整流程
- 项目加载和保存
- 创建新项目
- 编辑现有项目
- 项目列表展示

### 📚 文档

- AI 配置指南（OPENROUTER-SETUP.md）
- AI 迁移指南（AI-MIGRATION-GUIDE.md）
- AI 快速参考（AI-QUICK-REFERENCE.md）
- 更新日志（CHANGELOG-AI-UPDATE.md）

---

## v0.1.0 - 2026-04-10

### 🎉 初始版本

#### 项目初始化
- React 18 + TypeScript + Vite
- Node.js + Express + TypeScript
- PostgreSQL + Redis
- Docker Compose 配置

#### 用户认证
- 注册和登录
- JWT 认证
- 用户会话管理

#### 基础功能
- 项目 CRUD
- 任务 CRUD
- 甘特图基础渲染
- 分享功能
- 导出功能（PNG/CSV/JSON）

#### 设计系统
- Material Design 3
- TailwindCSS 配置
- 完整的颜色系统
- 图标系统

---

## 即将推出

### v0.4.0（计划中）

- 任务依赖关系可视化
- 甘特图横向滚动优化
- 里程碑标记
- 性能优化（虚拟化渲染）
- 批量操作

### v0.5.0（计划中）

- 实时协作
- 评论系统
- 权限管理
- PDF 导出
- 版本历史

### v1.0.0（目标）

- 完整的 M1-M4 阶段功能
- 移动端优化
- 键盘快捷键
- 国际化支持
- 生产环境部署

---

## 升级指南

### 从 v0.2.0 升级到 v0.3.0

1. 拉取最新代码：
   ```bash
   git pull origin main
   ```

2. 安装依赖：
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```

3. 重启服务：
   ```bash
   docker compose restart
   npm run dev  # 前端和后端分别运行
   ```

4. 清除浏览器缓存（推荐）

### 从 v0.1.0 升级到 v0.2.0

1. 更新代码和依赖（同上）

2. 配置 AI 功能：
   - 获取 API Key（OpenRouter 或 Anthropic）
   - 在应用中配置 AI 设置
   - 详见 [AI 配置指南](docs/OPENROUTER-SETUP.md)

3. 移除环境变量中的旧 API Key：
   - 删除 `CLAUDE_API_KEY`
   - 删除 `OPENROUTER_API_KEY`

---

## 已知问题

### v0.3.0

1. **任务依赖关系**：尚未实现可视化显示
2. **横向滚动**：甘特图横向滚动需要优化
3. **移动端**：移动端体验需要改进
4. **批量操作**：缺少批量编辑功能

### 解决方案

这些问题将在后续版本中解决：
- v0.4.0：任务依赖、横向滚动
- v0.5.0：移动端优化
- v1.0.0：批量操作

---

## 反馈渠道

- GitHub Issues: https://github.com/fukkix/gattxa/issues
- 邮件：[待添加]
- 社区：[待添加]

---

## 贡献者

感谢所有为 GanttXa 做出贡献的开发者！

- [@fukkix](https://github.com/fukkix) - 项目创建者
- AI Agent 团队 - 协作开发

---

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

**最后更新**：2026-04-11  
**下一版本**：v0.4.0（预计 2026-04-25）
