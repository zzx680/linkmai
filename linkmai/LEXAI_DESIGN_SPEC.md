# LexAI 律师操作平台 — UI 设计规范
> 供 Claude Code 阅读执行。风格参考：Kimi 开发者工作台（platform.kimi.com）

---

## 项目概述

**产品**：LexAI —— AI 驱动的律师工作平台  
**技术栈**：React 18 + TypeScript + Tailwind CSS + Vite  
**动画库**：framer-motion  
**图标库**：lucide-react  
**主题**：暗色优先，预留 `data-theme="light"` 切换钩子  
**目标分辨率**：1280px+（主），768px（适配）

---

## 一、Design Token

### 1.1 颜色系统（CSS 变量，写入 `index.css`）

```css
:root {
  /* 背景层级 */
  --bg-base:        #0d0d10;
  --bg-surface:     #14141a;
  --bg-elevated:    #1c1c26;
  --bg-hover:       #22222f;

  /* 边框 */
  --border-subtle:  rgba(255, 255, 255, 0.06);
  --border-default: rgba(255, 255, 255, 0.10);
  --border-strong:  rgba(255, 255, 255, 0.18);

  /* 文字 */
  --text-primary:   #f0f0f5;
  --text-secondary: #9b9bb0;
  --text-tertiary:  #5e5e74;

  /* Accent — Kimi 标志性紫蓝色 */
  --accent-700:     #4e3edd;
  --accent-600:     #6c5ce7;
  --accent-500:     #7d6ef0;
  --accent-400:     #9d8ff7;
  --accent-glow:    rgba(108, 92, 231, 0.22);

  /* 功能色 */
  --success:        #00b894;
  --success-bg:     rgba(0, 184, 148, 0.10);
  --warning:        #fdcb6e;
  --warning-bg:     rgba(253, 203, 110, 0.10);
  --danger:         #e17055;
  --danger-bg:      rgba(225, 112, 85, 0.10);

  /* 尺寸 */
  --sidebar-width:  240px;
  --topbar-height:  64px;
  --radius-sm:      6px;
  --radius-md:      10px;
  --radius-lg:      14px;
  --radius-xl:      18px;
}
```

### 1.2 字体

```css
/* 引入字体（在 index.html head 中） */
/* <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"> */

body {
  font-family: 'Inter', 'PingFang SC', 'Helvetica Neue', system-ui, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-primary);
  background: var(--bg-base);
}

.font-mono {
  font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
}
```

**字阶**：12 / 13 / 14 / 16 / 20 / 24 / 28 / 36px  
**行高**：正文 1.6，标题 1.25，紧凑列表 1.4

### 1.3 阴影

```css
--shadow-card:    0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px var(--border-subtle);
--shadow-hover:   0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px var(--border-default);
--shadow-accent:  0 0 20px var(--accent-glow);
--shadow-float:   0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px var(--border-default);
```

---

## 二、全局动效规范

```css
/* 统一 transition（写入 index.css） */
*, *::before, *::after {
  transition:
    background-color 0.15s ease,
    border-color     0.15s ease,
    box-shadow       0.2s  ease,
    color            0.15s ease,
    opacity          0.15s ease,
    transform        0.15s ease;
}

/* 页面/元素进入 */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animate-fade-up {
  animation: fadeUp 0.38s cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* Stagger 用法：每个子元素 animation-delay: calc(index * 60ms) */

/* Blur-in（Kimi 登录页特效） */
@keyframes blurIn {
  from { opacity: 0; filter: blur(8px); transform: scale(0.97); }
  to   { opacity: 1; filter: blur(0);   transform: scale(1); }
}

.animate-blur-in {
  animation: blurIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}
```

---

## 三、通用组件规范

### 3.1 Input 输入框

```
背景:      var(--bg-elevated)
边框:      1px solid var(--border-default)
圆角:      var(--radius-md)
内边距:    10px 14px
字色:      var(--text-primary)
Placeholder: var(--text-tertiary)

Focus 态:
  border-color: var(--accent-500)
  box-shadow: 0 0 0 3px var(--accent-glow)
  outline: none

Error 态:
  border-color: var(--danger)
  box-shadow: 0 0 0 3px rgba(225,112,85,0.18)
```

### 3.2 主按钮（CTA）

```
背景:   linear-gradient(135deg, var(--accent-600), var(--accent-700))
高度:   42px
圆角:   var(--radius-md)
字体:   font-weight: 600, 14px
颜色:   #ffffff
边框:   none

Hover:  filter: brightness(1.12); transform: translateY(-1px); box-shadow: var(--shadow-accent)
Active: transform: scale(0.97); filter: brightness(0.95)
Disabled: opacity: 0.4; cursor: not-allowed
```

### 3.3 次要按钮（Outline）

```
背景:   transparent
边框:   1px solid var(--border-default)
字色:   var(--text-secondary)
圆角:   var(--radius-md)
高度:   38px

Hover:  background: var(--bg-hover); border-color: var(--border-strong); color: var(--text-primary)
```

### 3.4 状态标签 Pill

```jsx
// 用法: <StatusPill status="active" />
const statusMap = {
  active:  { label: '进行中', color: 'accent' },
  closed:  { label: '已结案', color: 'success' },
  pending: { label: '待审核', color: 'warning' },
  urgent:  { label: '紧急',   color: 'danger'  },
}

// 样式: padding 3px 10px, border-radius 999px, font-size 12px, font-weight 500
// color 为 accent: background var(--accent-600)/10, color var(--accent-400)
// color 为 success: background var(--success-bg), color var(--success)
// 以此类推
```

### 3.5 卡片 Card

```
背景:   var(--bg-surface)
边框:   1px solid var(--border-subtle)
圆角:   var(--radius-lg)
阴影:   var(--shadow-card)
内边距: 20px 24px

Hover:
  border-color: var(--border-strong)
  box-shadow: var(--shadow-hover)
  transform: translateY(-1px)
```

### 3.6 导航项 NavItem

```
默认:   color var(--text-secondary), padding 8px 12px, border-radius var(--radius-md)
图标:   16px, opacity 0.65
文字:   14px, font-weight 500

Hover:
  background: var(--bg-hover)
  color: var(--text-primary)
  icon opacity: 1.0

激活:
  background: rgba(108,92,231,0.08)
  color: var(--accent-400)
  font-weight: 600
  icon opacity: 1.0
  左侧: border-left: 2px solid var(--accent-500)（通过 padding-left 补偿）
```

---

## 四、页面结构

### 4.1 文件结构

```
src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx      # 主布局（Sidebar + TopBar + Content）
│   │   ├── Sidebar.tsx
│   │   └── TopBar.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── StatusPill.tsx
│   │   └── NavItem.tsx
│   ├── dashboard/
│   │   ├── StatCard.tsx
│   │   └── CaseTable.tsx
│   └── ai/
│       └── AIInput.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── AIAssistantPage.tsx
│   ├── ContractReviewPage.tsx  # 路由占位
│   ├── LegalSearchPage.tsx     # 路由占位
│   └── CaseDetailPage.tsx      # 路由占位
├── router/
│   └── index.tsx               # React Router v6
├── styles/
│   └── index.css               # 全局 CSS 变量 + reset
└── main.tsx
```

---

## 五、LoginPage 详细规范

### 布局

```
┌────────────────────────────────────────────────┐
│  左侧品牌区 (42%)    │    右侧表单区 (58%)       │
│  bg-base             │    bg-surface             │
│  + 紫色径向渐变叠层  │    表单容器 max-w-400px    │
└──────────────────────┴───────────────────────────┘
移动端 (<768px): 仅显示右侧表单区
```

### 左侧品牌区内容

```
┌──────────────────────────┐
│ [Logo 左上角]             │
│                          │
│                          │
│  "让每一个案件           │
│   都有据可查"            │
│   (28px, semibold)       │
│                          │
│  AI 驱动的律师工作平台   │
│  (14px, text-secondary)  │
│                          │
│  ◉ 合同智能审查...       │
│  ◉ 案件时间线管理...     │
│  ◉ 法条数据库检索...     │
│                          │
│  [左下] © 2026 LexAI     │
└──────────────────────────┘

背景效果:
  radial-gradient(ellipse 80% 60% at 25% 55%, rgba(108,92,231,0.15), transparent)
  叠加在 bg-base 之上
  左下角额外: radial-gradient(circle at 10% 90%, rgba(0,184,148,0.06), transparent 50%)
```

### 右侧表单区内容（从上到下）

1. **小 Logo**：icon 20px + "LexAI" 文字，左上或居中，margin-bottom 40px
2. **标题**："欢迎回来" 20px semibold + 副标题 "登录到你的律师工作台" 13px text-secondary，间距 6px
3. **表单**（margin-top 28px）：
   - 邮箱 input（左侧 Mail icon 16px，text-tertiary）
   - 密码 input（左侧 Lock icon，右侧眼睛 toggle）
   - 底部行：Checkbox "记住登录" + 右侧 "忘记密码？"（accent-400 色，12px）
4. **登录按钮**：全宽，42px，渐变，文字"登录工作台" + 右箭头 icon
5. **分割线**：`── 或使用其他方式 ──`，text-tertiary，12px
6. **三方登录行**：企业微信 + 钉钉（outline 方形按钮，36px，各占半宽）
7. **注册引导**：底部居中，"还没有账户？" + "联系管理员开通" (accent-400)

---

## 六、DashboardPage 详细规范

### TopBar 内容

```
左: [≡ 汉堡可选] > 首页 / 案件总览      (面包屑)
右: [⌘K 搜索 pill] [🔔 通知 badge] [头像 + 姓名 ▾]

搜索 pill 样式:
  border: 1px solid var(--border-default)
  background: var(--bg-elevated)
  border-radius: 999px
  padding: 6px 14px
  color: var(--text-tertiary)
  font-size: 13px
  内容: "搜索案件、文档、客户…  ⌘K"
```

### Sidebar 导航结构

```
分组一：工作台
  LayoutDashboard  案件总览      /dashboard       ← 默认激活
  FolderOpen       文档管理      /documents
  Bot              AI 助手       /ai-assistant

分组二：法律工具
  FileText         合同审查      /contract-review
  Search           法条检索      /legal-search
  BarChart3        案件分析      /analytics

分组三：管理
  Users            客户管理      /clients
  Settings         账户设置      /settings

底部固定:
  进度条: "本月 AI 用量 / 1,200 次"
    bar: width: 用量%, background: var(--accent-600), height 3px, border-radius 999px
  用户卡: 头像(32px) + 姓名 + "专业版" badge
```

### 统计卡片（4列）

```
卡片1: 活跃案件
  icon: Briefcase (accent 色)
  value: 24
  change: ↑ 3 较上月

卡片2: 本月新增
  icon: Plus (success 色)
  value: 8
  change: ↑ 2 较上月

卡片3: 待审合同
  icon: FileWarning (warning 色)
  value: 5
  change: 需要处理

卡片4: AI 处理文件
  icon: Sparkles (accent 色)
  value: 142
  change: 本月累计

icon 容器: 36px × 36px, border-radius var(--radius-md), 对应色 opacity 12%
```

### 案件表格列定义

| 列名 | 宽度 | 说明 |
|------|------|------|
| 案件编号 | 120px | monospace，accent-400 色，如 `#LS-2024-089` |
| 案件名称 | flex | 主文字 text-primary + 副文字 text-tertiary |
| 客户 | 140px | 头像(24px) + 姓名 |
| 状态 | 100px | StatusPill 组件 |
| 负责律师 | 120px | text-secondary |
| 最后更新 | 120px | 相对时间 "3 小时前"，text-tertiary |
| 操作 | 80px | 三点菜单按钮 |

表格规范:
- 表头: 12px uppercase, letter-spacing 0.06em, text-tertiary, bg-elevated
- 行高: 56px, border-bottom: 1px solid var(--border-subtle)
- 行 hover: bg-hover, transition 0.15s
- 选中行: bg-accent-600/5, border-left: 2px solid accent-500

### 右侧 AI 助手面板（宽 320px）

```
标题行: 🤖 "AI 法律助手" + 展开箭头
状态点: 绿色 6px 圆点 + "在线"

快捷操作标签（pill，wrap）:
  "审查合同条款"  "检索司法解释"  "生成法律意见书"  "案件摘要"
  样式: border border-subtle, rounded-full, 10px 14px, 12px, hover bg-hover

输入区:
  textarea placeholder: "描述你的法律问题，或上传文件…"
  底部: 附件 icon + 字数限制提示 + 发送按钮
```

---

## 七、AIAssistantPage 详细规范

### 布局

```
┌─────────────────────────────────────────────┐
│  左侧历史列表 (260px)  │  右侧对话区 (flex-1) │
│  bg-surface            │  bg-base             │
│  border-r border-subtle│  max-w-3xl mx-auto   │
└────────────────────────┴─────────────────────┘
```

### 对话消息样式

```
用户消息 (右对齐):
  background: var(--bg-elevated)
  border: 1px solid var(--border-default)
  border-radius: 18px 18px 4px 18px
  padding: 10px 16px
  max-width: 72%
  align-self: flex-end

AI 消息 (左对齐，无气泡):
  无背景框，直接 markdown 渲染
  max-width: 86%
  align-self: flex-start
  代码块: bg-elevated, border border-subtle, rounded-lg, monospace
  引用块: border-left 3px solid accent-500, padding-left 12px, text-secondary
```

### 底部输入栏

```
位置: sticky bottom-0
背景: var(--bg-surface)/85，backdrop-blur-xl
上边框: 1px solid var(--border-subtle)
内边距: 12px 24px

输入框:
  背景: var(--bg-elevated)
  圆角: var(--radius-xl)
  边框: 1px solid var(--border-default)
  min-height: 48px, max-height: 160px (自动增高)
  padding: 12px 16px
  resize: none, overflow-y: auto

左侧 icon 组: Paperclip(附件), Image(图片)，各 20px，text-tertiary，hover accent-400
右侧: 字符计数(text-tertiary, 12px) + 发送按钮(accent 渐变, 36px×36px, rounded-lg)

Slash 命令浮层（输入 / 触发）:
  position: absolute, bottom: 100%, left: 0
  bg-elevated, border border-default, rounded-xl, shadow-float
  条目: icon + 命令名 + 说明，hover bg-hover
```

---

## 八、执行顺序

1. **初始化项目**：`npm create vite@latest lexai -- --template react-ts`，安装依赖
2. **写入 Design Token**：完成 `src/styles/index.css`，配置 Tailwind
3. **实现基础 UI 组件**：Button、Input、Card、StatusPill、NavItem
4. **实现 LoginPage**：左右分屏，全部动效
5. **实现 AppLayout**：Sidebar + TopBar，路由接入
6. **实现 DashboardPage**：统计卡片 + 案件表格 + AI 面板
7. **实现 AIAssistantPage**：历史列表 + 对话区 + 底部输入栏
8. **其余页面**：路由占位（空白页 + "功能开发中" 提示）

---

## 九、注意事项

- **不使用任何第三方 UI 组件库**（MUI / Ant Design / shadcn / Chakra），全部用 Tailwind + CSS 变量自行实现
- **所有颜色必须引用 CSS 变量**，不硬编码十六进制值（方便后续亮色主题切换）
- **图标统一使用 lucide-react**，尺寸统一为 16px（导航）/ 20px（内容区）
- **动画使用 framer-motion**，`AnimatePresence` 处理路由切换
- **中文字体回退链**：`'PingFang SC', 'Noto Sans SC', sans-serif`
- **Tailwind 中若需使用 CSS 变量**，在 `tailwind.config.ts` extend 对应 token

---

*此文件为 Claude Code 执行规范，请完整阅读后再开始编码。*
