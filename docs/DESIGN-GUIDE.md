# GanttXa 设计指南

基于 demo 文件夹的设计系统，本文档提供 GanttXa 项目的前端设计实现指南。

## 设计理念

**核心概念："编辑建筑师"（The Editorial Architect）**

我们拒绝传统项目管理工具的"电子表格"美学，而是将项目数据视为编辑叙事。通过高对比度的排版层次和非对称空间节奏，让甘特图感觉像高端蓝图而非繁琐工具。

## 颜色系统

### 主色调
- **Primary（深青色）**: `#00464a` - 用于主要操作按钮、强调元素
- **Primary Container**: `#006064` - 用于渐变、次级强调
- **Secondary（深蓝紫）**: `#4858ab` - 用于开发阶段标识
- **Tertiary（深紫）**: `#4e2490` - 用于设计阶段标识

### 表面层次
- **Background**: `#f8fafb` - 页面基础背景
- **Surface Container Low**: `#f2f4f5` - 侧边栏、次级区域
- **Surface Container Lowest**: `#ffffff` - 卡片、主要内容区
- **Surface Container High**: `#e6e8e9` - 输入框、工具栏

### "无边框"规则
**严格禁止使用 1px 实线边框进行分区。**

结构边界必须仅通过背景色变化来定义。例如：
- 侧边栏使用 `surface-container-low` 对比主面板的 `surface`
- 创造"模塑"外观而非"笼状"外观

### 玻璃态与渐变
浮动元素（如甘特图"今日"指示器、悬浮任务详情）应使用玻璃态效果：
- 填充：`surface` 70% 不透明度
- 效果：20px 背景模糊
- 甘特图任务条使用微妙的线性渐变（`primary` → `primary-container`）营造 3D"宝石"质感

## 排版系统

### 字体家族
- **Manrope**（标题字体）：用于项目标题、阶段标题 - 几何现代感
- **Inter**（正文字体）：用于甘特图标签、时间戳、正文 - 高 x-height 确保可读性

### 层次配对
始终将 `headline-sm`（`on-surface`）与 `label-md`（`on-surface-variant`）配对，无需全部使用粗体即可创建清晰的视觉层次。

## 深度与立体感

### 层叠原则
通过"堆叠"层级实现深度：
- 甘特图任务卡（`surface-container-lowest`）位于图表区域（`surface-container-low`）上，自然产生提升感

### 环境阴影
浮动元素（如"新建任务"模态框）使用：
- 颜色：`primary`（#00464a）6% 不透明度而非灰色
- 数值：`0px 24px 48px` - 模拟柔和的漫射自然光

### "幽灵边框"后备
如果无障碍需要对比度：
- 使用 `outline-variant` 15% 不透明度
- 应该被感知而非被看见

## 核心组件样式

### 甘特图任务条（标志性组件）
```css
background: linear-gradient(to right, #00464a, #006064);
border-radius: 0.375rem; /* md */
/* 移动端：折叠为"里程碑点"，使用 full 圆角 */
```

### 按钮
- **Primary**: 背景 `primary`，文字 `on-primary`，无阴影
- **Secondary**: 背景 `secondary-container`，文字 `on-secondary-container`
- **Tertiary**: 无背景，文字 `primary` - 用于低强调操作（取消、归档）

### 阶段标识芯片
- **研究阶段**: `primary-fixed-dim` 背景 + `on-primary-fixed` 文字
- **设计阶段**: `tertiary-fixed-dim` 背景 + `on-tertiary-fixed` 文字
- **开发阶段**: `secondary-fixed-dim` 背景 + `on-secondary-fixed` 文字

### 卡片与列表："隐形容器"
- **规则**：禁止使用分隔线
- **分隔**：使用 40px 垂直空白分隔列表项
- 如果内容密集，使用 `surface` 和 `surface-container-low` 之间的微妙交替

### 输入框
- **默认**: `surface-container-highest` 背景，无边框
- **聚焦**: 过渡到"幽灵边框"，使用 `primary` 40% 不透明度

## 实施建议

### 应该做的
✅ 使用有意的非对称性 - 项目标题左对齐，"分享"操作右对齐，中间留大量"留白"强调奢华感
✅ 对大型空状态使用 5% 不透明度的 `surface-tint`，避免看起来"损坏"
✅ 优化甘特图在移动端的横向滑动，同时使用 `surface-container-lowest` 玻璃效果固定任务名称

### 不应该做的
❌ 不要使用纯黑（#000000）作为文字 - 使用 `on-surface` 保持精致的青色调灰色
❌ 不要使用标准"成功绿" - 使用 `primary`（深青色）表示完成，更专业且符合调色板
❌ 不要对大型容器使用 `DEFAULT`（0.25rem）圆角 - 对主面板使用 `xl`（0.75rem）以软化整体"软件"感

## Tailwind 配置

项目已配置自定义颜色和圆角：

```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      'primary': '#00464a',
      'primary-container': '#006064',
      'secondary': '#4858ab',
      'tertiary': '#4e2490',
      'surface': '#f8fafb',
      'surface-container-low': '#f2f4f5',
      'surface-container-lowest': '#ffffff',
      // ... 更多颜色
    },
    borderRadius: {
      'DEFAULT': '0.125rem',
      'lg': '0.25rem',
      'xl': '0.5rem',
      'full': '0.75rem',
    },
    fontFamily: {
      'headline': ['Manrope'],
      'body': ['Inter'],
    }
  }
}
```

## 组件实现示例

### 甘特图任务条
```tsx
<div className="h-8 rounded-xl bg-gradient-to-r from-primary to-primary-container 
                hover:shadow-lg transition-all flex items-center px-3 
                text-[10px] text-on-primary font-bold cursor-pointer">
  Apr 12 - Apr 18 • Hub Ops
</div>
```

### 阶段标识
```tsx
<span className="px-3 py-1 bg-primary-fixed-dim text-on-primary-fixed-variant 
                 rounded-full text-[10px] font-bold uppercase tracking-widest">
  Research
</span>
```

### 玻璃态效果
```tsx
<div className="glass-effect rounded-xl p-4">
  {/* 内容 */}
</div>

<style>
.glass-effect {
  background: rgba(248, 250, 251, 0.7);
  backdrop-filter: blur(20px);
}
</style>
```

### 主操作按钮
```tsx
<button className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary 
                   rounded-xl font-bold text-sm hover:opacity-90 transition-all 
                   shadow-lg active:scale-95">
  <span className="material-symbols-outlined text-[20px]">upload</span>
  上传项目文件
</button>
```

## 响应式设计

### 移动端优化
- 甘特图支持横向滑动
- 任务名称列固定（使用玻璃态效果）
- 任务条在小屏幕上折叠为"里程碑点"
- 侧边栏在移动端隐藏，使用汉堡菜单

### 断点
- `md`: 768px - 显示侧边栏
- `lg`: 1024px - 显示完整工具栏按钮
- `xl`: 1280px - 4 列网格布局

## 图标系统

使用 Material Symbols Outlined：
```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
```

常用图标：
- `upload_file` - 上传
- `ios_share` - 分享
- `grid_view` - 网格视图
- `psychology` - AI 功能
- `auto_awesome` - 智能特性

## 动画与交互

### 过渡效果
```css
transition-all /* 用于大多数交互 */
hover:scale-110 /* 图标悬停 */
active:scale-95 /* 按钮按下 */
hover:opacity-90 /* 按钮悬停 */
```

### 悬浮状态
- 任务条：`hover:shadow-lg`
- 卡片：`hover:border-primary/20`
- 按钮：`hover:bg-cyan-50/50`（次级操作）

## 无障碍考虑

- 所有交互元素最小触摸目标 44x44px
- 颜色对比度符合 WCAG AA 标准
- 使用语义化 HTML
- 为图标按钮提供 aria-label
- 键盘导航支持

## 参考资源

- Demo 文件：`demo/code.html`
- 设计文档：`demo/DESIGN.md`
- 截图参考：`demo/screen.png`

---

**注意**：本指南基于 demo 参考，但不需要完全一致。根据 GanttXa 的实际功能模块灵活应用这些设计原则。重点是保持"编辑建筑师"的设计理念和高端、专业的视觉体验。
