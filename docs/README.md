# GanttXa 文档目录

**最后更新**: 2026-04-13

---

## 📚 文档结构

```
docs/
├── README.md                    # 本文件
├── guides/                      # 使用指南
│   ├── QUICKSTART.md           # 快速开始
│   ├── README-SETUP.md         # 环境搭建
│   ├── 测试指南.md              # 测试指南
│   ├── M4-QUICK-TEST.md        # M4 快速测试
│   ├── M4-WEEK2-MIGRATION.md   # M4 数据库迁移
│   └── M4-第2周-完成总结.md     # M4 第2周总结
├── archive/                     # 开发历史归档
│   ├── M3-*.md                 # M3 阶段文档
│   ├── M4-WEEK*.md             # M4 周报
│   ├── CHANGELOG-*.md          # 变更日志
│   ├── RELEASE-*.md            # 发布说明
│   └── ...                     # 其他历史文档
├── API.md                       # API 文档
├── AUTHENTICATION.md            # 认证文档
├── DESIGN-GUIDE.md              # 设计指南
├── FEATURES.md                  # 功能说明
├── M3-FEATURES.md               # M3 功能说明
├── OPENROUTER-SETUP.md          # OpenRouter 配置
├── PERFORMANCE.md               # 性能优化
├── SETUP.md                     # 环境搭建
├── USER-GUIDE.md                # 用户指南
├── AI-MIGRATION-GUIDE.md        # AI 迁移指南
├── AI-QUICK-REFERENCE.md        # AI 快速参考
├── DEPLOYMENT-GUIDE-CLOUD.md    # 云服务器部署（已移至根目录）
├── 部署指南-腾讯云.md            # 腾讯云部署（已移至根目录）
└── DEPLOYMENT-CHECKLIST.md      # 部署检查清单（已移至根目录）
```

---

## 📖 文档分类

### 🚀 快速开始

适合新用户快速上手：

1. **[快速开始](guides/QUICKSTART.md)** - 5分钟快速体验
2. **[环境搭建](guides/README-SETUP.md)** - 开发环境配置
3. **[用户指南](USER-GUIDE.md)** - 完整使用说明

### 👨‍💻 开发文档

适合开发者：

1. **[环境搭建](SETUP.md)** - 开发环境详细配置
2. **[API 文档](API.md)** - 后端 API 接口说明
3. **[设计指南](DESIGN-GUIDE.md)** - UI/UX 设计规范
4. **[性能优化](PERFORMANCE.md)** - 性能优化指南

### 🎨 功能文档

了解系统功能：

1. **[功能说明](FEATURES.md)** - 核心功能介绍
2. **[M3 功能](M3-FEATURES.md)** - M3 协作功能
3. **[认证系统](AUTHENTICATION.md)** - 用户认证说明

### 🤖 AI 功能

AI 文件解析相关：

1. **[OpenRouter 配置](OPENROUTER-SETUP.md)** - AI 服务配置
2. **[AI 迁移指南](AI-MIGRATION-GUIDE.md)** - AI 功能迁移
3. **[AI 快速参考](AI-QUICK-REFERENCE.md)** - AI 使用参考

### 🧪 测试文档

测试相关指南：

1. **[测试指南](guides/测试指南.md)** - 功能测试指南
2. **[M4 快速测试](guides/M4-QUICK-TEST.md)** - M4 实时协作测试
3. **[M4 数据库迁移](guides/M4-WEEK2-MIGRATION.md)** - 数据库迁移指南

### 📦 部署文档

部署到生产环境：

**注意**: 部署文档已移至项目根目录

1. **[云服务器部署](../DEPLOYMENT-GUIDE-CLOUD.md)** - 完整部署指南
2. **[腾讯云部署](../docs/部署指南-腾讯云.md)** - 腾讯云简化指南
3. **[快速部署](../QUICK-DEPLOY.md)** - 快速部署参考
4. **[部署检查清单](../docs/DEPLOYMENT-CHECKLIST.md)** - 部署检查项

### 📜 开发历史

查看开发过程：

**注意**: 开发历史文档已移至根目录

1. **[开发历史](../DEVELOPMENT-HISTORY.md)** - 完整开发历史
2. **[开发进度](../DEVELOPMENT-PROGRESS.md)** - 当前开发进度
3. **[M4 计划](../M4-PLAN.md)** - M4 阶段计划
4. **[归档文档](archive/)** - 历史文档归档

---

## 🗂️ 归档文档

`archive/` 目录包含开发过程中的历史文档：

### M3 阶段文档
- M3-COMPLETE.md - M3 完成报告
- M3-FINAL-SUMMARY.md - M3 最终总结
- M3-NOTIFICATION-UPDATE.md - 通知功能更新
- M3-PERMISSIONS-UPDATE.md - 权限功能更新
- M3-INVITATION-PAGE-UPDATE.md - 邀请页面更新
- 等等...

### M4 阶段文档
- M4-WEEK1-COMPLETE.md - 第1周完成报告
- M4-WEEK1-SUMMARY-CN.md - 第1周中文总结
- M4-WEEK2-COMPLETE.md - 第2周完成报告
- M4-TESTING-GUIDE.md - 测试指南
- M4-TESTING-STATUS.md - 测试状态
- 等等...

### 变更日志
- CHANGELOG-AI-UPDATE.md - AI 更新日志
- CHANGELOG-M3.md - M3 变更日志
- CHANGELOG-M3-NOTIFICATIONS.md - M3 通知变更
- 等等...

### 发布说明
- RELEASE-v1.0.md - v1.0 发布说明
- RELEASE-NOTES.md - 发布说明
- 等等...

### 其他历史文档
- NODE-UPGRADE-GUIDE.md - Node.js 升级指南
- MODEL-UPDATE.md - 模型更新
- UI-IMPROVEMENTS.md - UI 改进
- DEBUG-EMPTY-GANTT.md - 调试文档
- 等等...

---

## 📝 文档约定

### 文件命名

- **英文文档**: 使用大写字母和连字符，如 `QUICK-START.md`
- **中文文档**: 使用中文和连字符，如 `测试指南.md`
- **阶段文档**: 使用 `M{阶段}-{描述}.md` 格式
- **周报文档**: 使用 `M{阶段}-WEEK{周数}-{描述}.md` 格式

### 文档结构

每个文档应包含：
1. 标题和元信息（日期、版本等）
2. 目录（如果内容较长）
3. 正文内容
4. 相关链接
5. 更新日志

### Markdown 规范

- 使用 ATX 风格标题（`#`）
- 代码块指定语言
- 使用表格展示数据
- 使用 emoji 增强可读性（适度）
- 添加目录链接（长文档）

---

## 🔍 快速查找

### 我想...

**开始使用 GanttXa**
→ [快速开始](guides/QUICKSTART.md)

**搭建开发环境**
→ [环境搭建](SETUP.md)

**了解 API 接口**
→ [API 文档](API.md)

**配置 AI 解析**
→ [OpenRouter 配置](OPENROUTER-SETUP.md)

**部署到服务器**
→ [云服务器部署](../DEPLOYMENT-GUIDE-CLOUD.md)

**测试实时协作**
→ [M4 快速测试](guides/M4-QUICK-TEST.md)

**查看开发历史**
→ [开发历史](../DEVELOPMENT-HISTORY.md)

**了解性能优化**
→ [性能优化](PERFORMANCE.md)

---

## 📞 需要帮助？

如果找不到需要的文档，请：

1. 查看 [README.md](../README.md) - 项目主页
2. 查看 [开发历史](../DEVELOPMENT-HISTORY.md) - 完整开发记录
3. 查看 [开发进度](../DEVELOPMENT-PROGRESS.md) - 当前进度
4. 提交 Issue 到 GitHub

---

## 🔄 文档更新

文档会随着项目开发持续更新。

**更新频率**:
- 用户文档：功能更新时
- 开发文档：重大变更时
- 历史文档：每周归档
- API 文档：接口变更时

**贡献文档**:
欢迎提交文档改进建议！

---

**文档维护**: fukki  
**最后更新**: 2026-04-13  
**文档版本**: 1.0

