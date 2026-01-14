
<div align="center">
  <br/>
  <h1>🏳️‍🌈 <b>kif Nuxt Template 🏳️‍🌈</b></h1>
  <p>一个基于 Nuxt 4 的现代化开发模板</p>
</div>

## ✨ 特性

- 💚 **Nuxt 4** - 最新版本的 Nuxt 框架
- ⚡️ **Vite** - 极速的开发体验
- 🎨 **UnoCSS** - 即时按需的原子化 CSS 引擎
- 🌙 **深色模式** - 使用 View Transition API 实现流畅的深色模式切换动画
- 🔥 **`<script setup>` 语法** - Vue 3 最新的语法糖
- 📥 **API 自动导入** - Composition API、VueUse 和自定义 composables 自动导入
- 🦾 **TypeScript** - 类型安全
- 🧍‍♀️ **VueUse** - 强大的 Vue Composition API 工具集
- 🎯 **组件自动导入** - 自动导入组件，无需手动注册

## 📦 技术栈

- [💚 Nuxt 4](https://nuxt.com/) - SSR、ESR、基于文件的路由、组件自动导入等
- ⚡️ [Vite](https://vitejs.dev/) - 新一代前端构建工具
- 🎨 [UnoCSS](https://github.com/unocss/unocss) - 即时按需的原子化 CSS 引擎
- 🧍‍♀️ [VueUse](https://vueuse.org/) - Vue Composition API 工具集
- 🦾 [TypeScript](https://www.typescriptlang.org/) - JavaScript 的超集

## 🚀 快速开始

### 📒 安装依赖

```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install

# 或使用 yarn
yarn install
```

### 📒 开发服务器

启动开发服务器，访问 `http://localhost:3000`

```bash
pnpm dev
```

### 📒 生产构建

构建生产环境的应用：

```bash
pnpm build
```

本地预览生产构建：

```bash
pnpm preview
```

## 📂 项目结构

```
kifsnuxt4template/
├── app/
│   ├── app.vue              # 应用主入口
│   ├── assets/              # 静态资源（样式、字体等）
│   │   ├── css/
│   │   │   ├── index.css    # 全局样式
│   │   │   └── font.css     # 字体样式
│   │   └── font/            # 字体文件
│   ├── components/          # Vue 组件
│   │   ├── AppHeader.vue    # 顶部导航组件
│   │   ├── AppFooter.vue    # 底部组件
│   │   └── Darkmode.vue     # 深色模式切换组件
│   ├── layouts/             # 布局组件
│   │   └── default.vue      # 默认布局
│   ├── pages/               # 页面（自动路由）
│   │   └── index.vue        # 首页
│   └── utils/               # 工具函数
│       └── index.ts         # 通用工具函数
├── public/                  # 公共静态资源
├── nuxt.config.ts          # Nuxt 配置文件
├── package.json            # 项目依赖配置
└── README.md               # 项目说明文档
```

## 🎨 组件说明

### Darkmode 组件
- 实现了基于 View Transition API 的流畅深色模式切换动画
- 根据时间自动判断是否开启深色模式（18:00-6:00）
- 支持 Chrome 浏览器的视图转换效果

### AppHeader 组件
- 顶部导航栏
- 集成深色模式切换按钮

### AppFooter 组件
- 底部信息展示

## ⚙️ 配置说明

### UnoCSS 配置

本模板使用 UnoCSS 作为 CSS 引擎，配置包括：
- **UnoCSS Preset Uno** - 默认预设
- **UnoCSS Icons** - 图标支持，可从 [Icônes](https://icones.js.org/) 选择图标
- **Attributify Mode** - 属性化模式，更灵活的样式写法

### VueUse 集成

自动导入 VueUse 的 Composition API 工具函数，如：
- `useMouse()` - 鼠标位置追踪
- `useToggle()` - 状态切换
- 更多功能参考 [VueUse 文档](https://vueuse.org/)

## 🔧 依赖版本问题解决

如果遇到 `oxc-parser` 相关的原生绑定错误，已在 `package.json` 中添加了必要的原生绑定包：
- `@oxc-parser/binding-darwin-arm64`
- `@oxc-transform/binding-darwin-arm64`
- `@oxc-minify/binding-darwin-arm64`

这些包确保了在 macOS ARM64 架构上的正常运行。

## 📚 学习资源

- [Nuxt 4 文档](https://nuxt.com/docs/getting-started/introduction)
- [UnoCSS 文档](https://unocss.dev/)
- [VueUse 文档](https://vueuse.org/)
- [Vue 3 文档](https://vuejs.org/)
- [TypeScript 文档](https://www.typescriptlang.org/)

## 📝 许可证

MIT License

---

<div align="center">
  <sub>使用 ❤️ 和 Nuxt 4 构建</sub>
</div>
