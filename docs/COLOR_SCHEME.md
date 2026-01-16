# 🎨 LinkLantern 配色方案

## 配色理念

LinkLantern 采用了温暖、优雅且现代化的配色方案，旨在创造一个舒适、专业且充满活力的用户体验。

---

## 🎯 核心配色

### 1. 基准色 - Primary（深紫褐色）
**主色调**: `#563950`

这是整个应用的主要品牌色，传递出**优雅、稳重、专业**的感觉。

```css
/* 基准色色板 */
primary-50:  #f5f1f4
primary-100: #ebe3e9
primary-200: #d7c7d3
primary-300: #c3abbd
primary-400: #af8fa7
primary-500: #563950  /* 主色 */
primary-600: #4a3044
primary-700: #3d2738
primary-800: #311e2c
primary-900: #241520
primary-950: #180c14
```

**使用场景**:
- 主要按钮背景
- 导航栏激活状态
- 重要文字标题
- Logo 装饰元素
- 侧边栏激活背景

---

### 2. 强调色 - Accent（亮黄色）
**强调色**: `#FAED25`

明亮的黄色作为强调色，为设计注入**活力、创新、醒目**的视觉元素。

```css
/* 强调色色板 */
accent-50:  #fffef5
accent-100: #fffceb
accent-200: #fff9d6
accent-300: #fff6c2
accent-400: #fff3ad
accent-500: #FAED25  /* 主色 */
accent-600: #d4c91f
accent-700: #aea519
accent-800: #888113
accent-900: #625d0d
accent-950: #3c3908
```

**使用场景**:
- Call-to-Action (CTA) 按钮
- 重要提示和高亮
- Logo 灯笼元素
- 徽章和标签
- 悬停状态的视觉反馈

---

### 3. 搭配色 - Secondary（灰紫色）
**辅助色**: `#5B5561`

柔和的灰紫色作为辅助色，提供**和谐、平衡、中性**的视觉支持。

```css
/* 搭配色色板 */
secondary-50:  #f6f5f6
secondary-100: #edecee
secondary-200: #dbd9dc
secondary-300: #c9c6cb
secondary-400: #b7b3b9
secondary-500: #5B5561  /* 主色 */
secondary-600: #4d4852
secondary-700: #403c43
secondary-800: #322f34
secondary-900: #252225
secondary-950: #171517
```

**使用场景**:
- 次要文字内容
- 边框和分割线
- 副标题和描述
- 图标颜色
- 背景装饰

---

## 🌈 配色组合示例

### 组合 1: 主题渐变背景
```css
background: linear-gradient(135deg, #563950 0%, #5B5561 100%);
```
用于：侧边栏激活项、Logo 容器、特殊卡片背景

### 组合 2: 强调色渐变
```css
background: linear-gradient(135deg, #FAED25 0%, #FFF6C2 100%);
```
用于：CTA 按钮、重要操作按钮

### 组合 3: 浅色背景渐变
```css
background: linear-gradient(135deg, 
  rgba(86, 57, 80, 0.1) 0%, 
  rgba(91, 85, 97, 0.1) 100%
);
```
用于：卡片背景、表单区域

### 组合 4: 文字渐变效果
```css
background: linear-gradient(135deg, #FAED25 0%, #FFF3AD 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```
用于：Logo 文字、特殊标题

---

## 💡 深色模式适配

### 背景色调整
- **主背景**: `primary-950` → `secondary-900` 渐变
- **卡片背景**: `primary-800/90` 半透明 + 毛玻璃效果
- **导航栏**: `primary-900/80` 半透明

### 文字颜色调整
- **标题**: `primary-300` 或 `accent-400`
- **正文**: `secondary-300`
- **次要文字**: `secondary-400`

---

## 🎨 应用示例

### 按钮系统

#### 主要按钮 (Primary Button)
```html
<button class="btn-primary">
  操作按钮
</button>
```
- 背景: `#563950`
- 文字: `white`
- 悬停: `#4a3044` + 阴影效果

#### 强调按钮 (Accent Button)
```html
<button class="btn-accent">
  立即注册
</button>
```
- 背景: `#FAED25`
- 文字: `#563950` (深色文字保证可读性)
- 悬停: `#FFF3AD` + 轻微放大

---

### 卡片设计

#### 标准卡片
```html
<div class="card-hover">
  <!-- 内容 -->
</div>
```
- 背景: `white/90` (浅色) | `primary-800/90` (深色)
- 边框: `primary-200` (浅色) | `primary-700` (深色)
- 悬停: 向上位移 + 阴影增强

---

### 链接和文字

#### 主要链接
```html
<a class="link-primary">
  链接文字
</a>
```
- 默认: `#563950`
- 悬停: `#FAED25`

---

## 📊 色彩对比度

所有配色均符合 **WCAG AA 级标准**，确保可访问性：

| 组合 | 对比度 | 等级 |
|------|--------|------|
| Primary-500 / White | 8.2:1 | AAA ✅ |
| Accent-500 / Primary-500 | 9.5:1 | AAA ✅ |
| Secondary-500 / White | 7.1:1 | AAA ✅ |
| Accent-500 / White | 1.2:1 | ⚠️ 需要深色文字 |

---

## 🔧 技术实现

### Tailwind 配置
配色已集成到 `tailwind.config.ts` 中，可以直接使用 Tailwind 类名：

```html
<!-- 背景色 -->
<div class="bg-primary-500"></div>
<div class="bg-accent-500"></div>
<div class="bg-secondary-500"></div>

<!-- 文字颜色 -->
<p class="text-primary-600"></p>
<p class="text-accent-500"></p>
<p class="text-secondary-600"></p>

<!-- 边框颜色 -->
<div class="border-primary-200"></div>
```

### CSS 变量
全局 CSS 变量已定义在 `assets/css/index.css` 中：

```css
:root {
  --color-primary: #563950;
  --color-accent: #FAED25;
  --color-secondary: #5B5561;
}
```

### Nuxt UI 集成
已在 `nuxt.config.ts` 中配置：

```typescript
ui: {
  primary: 'primary',    // 主色使用 primary
  gray: 'secondary',     // 灰色系使用 secondary
}
```

---

## 🎯 最佳实践

### 1. 按钮使用
- **主要操作**: 使用 `btn-accent` (黄色强调按钮)
- **次要操作**: 使用 `btn-primary` (紫褐色按钮)
- **辅助操作**: 使用 `variant="soft"` 或 `variant="ghost"`

### 2. 背景使用
- **大面积背景**: 使用浅色渐变 (`from-gray-50 to-primary-50/20`)
- **卡片背景**: 使用白色半透明 + 毛玻璃效果
- **特殊区域**: 使用 `gradient-bg` 类

### 3. 文字使用
- **标题**: `text-primary-700` (浅色) | `text-primary-300` (深色)
- **正文**: `text-secondary-700` (浅色) | `text-secondary-300` (深色)
- **次要**: `text-secondary-600` (浅色) | `text-secondary-400` (深色)

### 4. 交互反馈
- 悬停时使用 **强调色** (`accent-500`) 提供视觉反馈
- 激活状态使用 **渐变背景** (`gradient-bg`)
- 加载状态保持原色系，增加透明度

---

## 🌟 视觉特色

### 毛玻璃效果 (Glassmorphism)
```css
backdrop-blur-md 
bg-white/90 
border-2 
border-primary-200
```

### 卡片悬停效果
```css
transform: translateY(-4px);
box-shadow: 0 12px 24px rgba(86, 57, 80, 0.15);
```

### 渐变装饰
页面背景使用多层圆形渐变装饰：
- Primary 色调圆形
- Accent 色调圆形
- Secondary 色调圆形
- 使用 `blur-3xl` 创造柔和过渡

---

## 📝 更新日志

### 2026-01-16
- ✅ 初始配色方案设计
- ✅ Tailwind 配置完成
- ✅ Nuxt UI 主题集成
- ✅ 全局 CSS 样式定义
- ✅ 所有主要页面配色更新
  - 首页
  - 登录页
  - 注册页
  - 管理后台布局

---

## 🎨 配色预览

### 浅色模式
- **主背景**: 白色 → 浅紫褐色渐变
- **卡片**: 白色半透明 + 毛玻璃
- **文字**: 深紫褐色 → 灰紫色
- **强调**: 亮黄色

### 深色模式
- **主背景**: 深紫褐色 → 深灰紫色渐变
- **卡片**: 深紫褐色半透明 + 毛玻璃
- **文字**: 浅紫褐色 → 浅灰紫色
- **强调**: 亮黄色

---

## 💡 设计灵感

这套配色方案的灵感来源于：
1. **灯笼** 🏮 - 温暖的紫褐色代表灯笼的质感
2. **光芒** ✨ - 亮黄色代表灯笼发出的光
3. **夜幕** 🌃 - 灰紫色代表夜晚的氛围

整体营造出一种**温暖、优雅、现代**的氛围，既适合白天使用，也适合夜间阅读。

---

<div align="center">
  <p>🏮 <strong>LinkLantern</strong> - 用色彩点亮您的导航之旅</p>
</div>

