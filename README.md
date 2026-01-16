
<div align="center">
  <br/>
  <h1>🏮 <b>LinkLantern</b> 🏮</h1>
  <p>现代化的个人链接管理与分享平台</p>
  <p>基于 Nuxt 4 构建的全栈应用</p>
</div>

## ✨ 特性

- 💚 **Nuxt 4** - 最新版本的 Nuxt 框架，SSR/CSR 混合渲染
- ⚡️ **Vite** - 极速的开发体验
- 🎨 **Nuxt UI** - 美观且功能强大的 UI 组件库
- 🗄️ **Prisma + MySQL** - 现代化的数据库 ORM，类型安全的数据库访问
- 🔗 **链接管理** - 完整的 CRUD 功能，分类管理，点击统计
- 📄 **分页查询** - 服务端分页，支持大量数据高效管理
- 🔍 **智能搜索** - 多搜索引擎支持，实时搜索建议，API 集成
- 🔥 **热点榜单** - 实时热榜聚合，支持微博、知乎、B站、掘金等 50+ 平台
- ⭐ **网页推荐** - 发现和分享优质链接，社区内容共享
- 🎛️ **管理后台** - 完整的后台管理系统，数据可视化
- 🔐 **用户认证** - JWT 认证，访问/刷新令牌机制
- 🌙 **深色模式** - 完美适配深色主题
- 🦾 **TypeScript** - 完整的类型安全
- 🧍‍♀️ **VueUse** - 强大的 Vue Composition API 工具集
- 🎯 **组件化** - 可复用的组件和 Composables

## 📦 技术栈

### 前端
- [💚 Nuxt 4](https://nuxt.com/) - SSR、ESR、基于文件的路由、组件自动导入
- [🎨 Nuxt UI](https://ui.nuxt.com/) - 基于 Tailwind CSS 的 UI 组件库
- [🧍‍♀️ VueUse](https://vueuse.org/) - Vue Composition API 工具集
- ⚡️ [Vite](https://vitejs.dev/) - 新一代前端构建工具

### 后端
- [🗄️ Prisma](https://www.prisma.io/) - 现代化的数据库 ORM 工具
- 🐬 MySQL - 关系型数据库
- 🔐 JWT - JSON Web Token 认证
- 🔒 bcryptjs - 密码加密

### 开发工具
- [🦾 TypeScript](https://www.typescriptlang.org/) - JavaScript 的超集
- 🎯 ESLint - 代码质量检查
- 📝 Git - 版本控制

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

### 📒 配置环境变量

在项目根目录创建 `.env` 文件：

```env
# 数据库连接（必填）
DATABASE_URL="mysql://用户名:密码@主机:端口/数据库名?sslaccept=strict"

# JWT 密钥（生产环境必须修改！）
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key

# JWT 有效期
JWT_EXPIRES_IN=1h          # 访问令牌：1小时
JWT_REFRESH_EXPIRES_IN=7d  # 刷新令牌：7天
```

### 📒 初始化数据库

```bash
# 推送数据库模型
pnpm db:push

# 运行种子文件（初始化数据库结构）
pnpm db:seed
```

### 📒 开发服务器

启动开发服务器，访问 `http://localhost:3000`

```bash
pnpm dev
```

### 📒 创建第一个账户

1. 启动开发服务器后，访问 `http://localhost:3000/register`
2. 填写邮箱和密码进行注册
3. 注册成功后自动跳转到首页

### 📒 数据库管理

**首次设置数据库**：

1. 确保已创建 `.env` 文件并配置好数据库连接
2. 推送数据库模型：

```bash
# 推送数据库模型（快速开发，推荐）
pnpm db:push

# 或生成 Prisma Client（如果需要）
pnpm prisma:generate
```

**数据库管理命令**：

```bash
# 打开 Prisma Studio 可视化管理数据库
pnpm db:studio

# 创建迁移文件（生产环境推荐）
pnpm db:migrate

# 重新生成 Prisma Client
pnpm prisma:generate
```

**测试 API**：

启动开发服务器后，可以访问以下 API：

**用户管理：**
- `GET http://localhost:3000/api/users` - 获取所有用户
- `POST http://localhost:3000/api/users` - 创建新用户

**认证相关：**
- `POST http://localhost:3000/api/auth/register` - 用户注册
- `POST http://localhost:3000/api/auth/login` - 用户登录
- `GET http://localhost:3000/api/auth/me` - 获取当前用户信息（需要 JWT）
- `PUT http://localhost:3000/api/auth/me` - 更新当前用户信息（需要 JWT）
- `PUT http://localhost:3000/api/auth/password` - 修改密码（需要 JWT）

**链接管理：**
- `GET http://localhost:3000/api/links` - 获取我的链接（需要 JWT）
- `POST http://localhost:3000/api/links` - 创建链接（需要 JWT）
- `PUT http://localhost:3000/api/links/:id` - 更新链接（需要 JWT）
- `DELETE http://localhost:3000/api/links/:id` - 删除链接（需要 JWT）
- `GET http://localhost:3000/api/links/public` - 获取公开推荐链接（无需认证）
- `POST http://localhost:3000/api/links/:id/click` - 记录点击（需要 JWT）

**搜索相关：**
- `GET http://localhost:3000/api/search/suggestions` - 获取搜索建议（无需认证）

**热点榜单：**
- `GET http://localhost:3000/api/hotboard?type=weibo` - 获取指定平台热榜数据（无需认证）

📖 详细的 API 使用说明请查看：
- [认证功能文档](./docs/AUTH_GUIDE.md)
- [链接管理文档](./docs/LINK_GUIDE.md)
- [分页功能文档](./docs/PAGINATION_FEATURE.md)
- [网页推荐文档](./docs/PUBLIC_LINKS_FEATURE.md)
- [管理后台文档](./docs/ADMIN_GUIDE.md)

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
LinkLantern/
├── app/
│   ├── app.vue              # 应用主入口
│   ├── assets/              # 静态资源（样式、字体等）
│   ├── components/          # Vue 组件
│   │   ├── HotboardList.vue # 热点榜单组件
│   │   └── MyLinksList.vue  # 我的链接组件
│   ├── composables/         # 可复用的组合式函数
│   │   ├── useAuth.ts       # 认证状态管理
│   │   ├── useLinks.ts      # 链接管理
│   │   ├── useSearch.ts     # 搜索功能
│   │   └── useHotboard.ts   # 热榜数据管理
│   ├── layouts/             # 布局组件
│   │   ├── default.vue      # 默认布局
│   │   └── admin.vue        # 管理后台布局
│   ├── middleware/          # 前端中间件
│   │   └── auth.ts          # 认证路由保护
│   ├── pages/               # 页面（自动路由）
│   │   ├── index.vue        # 首页（搜索+热榜+链接）
│   │   ├── login.vue        # 登录页面
│   │   ├── register.vue     # 注册页面
│   │   └── admin/           # 管理后台页面
│   │       ├── index.vue    # 概览仪表板
│   │       ├── profile.vue  # 个人信息管理
│   │       ├── links.vue    # 链接管理（表格+分页）
│   │       └── settings.vue # 关于页面
│   └── plugins/             # 插件
│       └── auth.client.ts   # 客户端认证状态恢复
├── server/                  # 服务端代码
│   ├── api/                 # API 路由
│   │   ├── auth/            # 认证相关 API
│   │   │   ├── register.post.ts  # 用户注册
│   │   │   ├── login.post.ts     # 用户登录
│   │   │   ├── me.get.ts         # 获取当前用户
│   │   │   ├── me.put.ts         # 更新当前用户
│   │   │   └── password.put.ts   # 修改密码
│   │   ├── links/           # 链接管理 API
│   │   │   ├── index.get.ts      # 获取链接（支持分页）
│   │   │   ├── index.post.ts     # 创建链接
│   │   │   ├── public.get.ts     # 获取公开链接
│   │   │   ├── [id].get.ts       # 获取单个链接
│   │   │   ├── [id].put.ts       # 更新链接
│   │   │   ├── [id].delete.ts    # 删除链接
│   │   │   ├── [id]/click.post.ts # 记录点击
│   │   │   └── stats.get.ts      # 获取统计
│   │   ├── search/          # 搜索相关 API
│   │   │   └── suggestions.get.ts # 搜索建议
│   │   └── hotboard/        # 热榜 API
│   │       └── index.get.ts      # 热榜数据代理
│   └── utils/               # 服务端工具函数
│       ├── prisma.ts        # Prisma 客户端实例
│       ├── auth.ts          # JWT、密码加密
│       └── auth-middleware.ts # 认证中间件
├── prisma/                  # Prisma 配置
│   ├── schema.prisma        # 数据库模型定义
│   ├── migrations/          # 数据库迁移文件
│   └── seed.js              # 数据库种子文件
├── docs/                    # 完整文档
│   ├── PRISMA_GUIDE.md      # Prisma 使用指南
│   ├── AUTH_GUIDE.md        # 认证功能文档
│   ├── LINK_GUIDE.md        # 链接管理 API 文档
│   ├── PAGINATION_FEATURE.md # 分页功能说明
│   ├── SEARCH_SUGGESTIONS.md # 搜索功能文档
│   ├── PUBLIC_LINKS_FEATURE.md # 网页推荐功能
│   ├── ADMIN_GUIDE.md       # 管理后台指南
│   └── FEATURES_SUMMARY.md  # 功能总结
├── public/                  # 公共静态资源
├── .env                     # 环境变量（需创建）
├── nuxt.config.ts          # Nuxt 配置文件
├── package.json            # 项目依赖配置
└── README.md               # 项目说明文档
```

## 🎨 页面说明

### 首页 (`/`)

**已登录用户视图：**
- **搜索功能**：
  - 支持 Google、Bing、百度、GitHub 多引擎搜索
  - 实时搜索建议（历史、链接匹配、API 建议）
  - 键盘导航支持
- **Tab 切换**：
  - **我的链接**：查看和快速访问个人链接，按分类筛选
  - **热点榜**：50+ 平台实时热榜，可折叠，支持平台切换

**未登录用户视图：**
- 功能介绍和特性展示
- 网页推荐（公开链接分享）
  - 热门/最新排序
  - 点击量统计
  - 分享者信息（隐私保护）
- 引导注册/登录

### 登录页面 (`/login`)
- 邮箱密码登录
- 表单验证
- 测试账号快速登录按钮
- 错误提示
- 跳转到注册页面

### 注册页面 (`/register`)
- 用户注册表单
- 实时密码强度指示器
- 邮箱格式验证
- 密码确认
- 服务条款同意选项

### 管理后台 (`/admin/*`)

需要登录才能访问，包含以下页面：

#### 概览页面 (`/admin`)
- 数据统计卡片（总链接数、总点击、公开链接）
- 最近添加的链接
- 热门链接（按点击量）

#### 个人信息 (`/admin/profile`)
- 编辑个人资料（姓名、头像）
- 修改密码
- 账户信息展示

#### 链接管理 (`/admin/links`)
- **表格样式列表**，一屏显示更多数据
- **分页查询**，支持大量链接
- **搜索筛选**：按标题、URL、描述搜索
- **分类筛选**：下拉选择分类
- **排序功能**：按创建时间、点击量、标题排序
- **CRUD 操作**：新增、编辑、删除链接
- **模态框**：友好的交互体验

#### 关于页面 (`/admin/settings`)
- 应用信息展示
- 版本号
- 技术栈介绍
- 功能特色列表

📖 详细文档：[管理后台使用指南](./docs/ADMIN_GUIDE.md) | [分页功能说明](./docs/PAGINATION_FEATURE.md)

## ✨ 主要功能

### 🔍 智能搜索
- **多搜索引擎支持**：
  - Google、Bing、百度、GitHub
  - 一键切换搜索引擎
  - 支持快捷键操作
- **实时搜索建议**：
  - 搜索历史记录（localStorage 存储）
  - 用户链接智能匹配
  - 搜索引擎 API 集成（Google、Bing、Baidu）
  - 去重和排序优化
- **键盘导航**：
  - 上下键选择建议
  - Enter 键确认搜索
  - ESC 关闭建议面板

📖 详细文档：[搜索功能说明](./docs/SEARCH_SUGGESTIONS.md) | [搜索引擎 API](./docs/SEARCH_ENGINE_API.md)

### 🔥 热点榜单
- **50+ 平台聚合**：
  - 社交媒体：微博、知乎、豆瓣
  - 技术平台：掘金、V2EX、GitHub
  - 视频平台：B站、抖音、快手
  - 新闻资讯：澎湃、36氪、虎嗅
  - 更多平台持续更新中...
- **实时数据**：每个榜单显示 TOP 10-50 条热门内容
- **智能缓存**：5 分钟缓存，减少 API 调用
- **平台管理**：
  - 自定义激活平台
  - 平台图标和名称展示
  - 快速切换浏览

### ⭐ 网页推荐
- **公开分享机制**：
  - 用户可将优质链接设置为公开
  - 与社区分享有价值的资源
- **灵活排序**：
  - 热门排序：按点击量展示最受欢迎的链接
  - 最新排序：按创建时间展示最新分享
- **隐私保护**：
  - 分享者邮箱自动脱敏（a***@example.com）
  - 只显示必要的分享信息
- **无需登录**：所有用户都可浏览公开推荐

📖 详细文档：[网页推荐功能](./docs/PUBLIC_LINKS_FEATURE.md)

### 🔗 链接管理
- **完整的 CRUD 操作**：
  - 创建：添加新链接，支持图标、描述、分类
  - 查看：列表和详情查看
  - 更新：编辑链接信息
  - 删除：安全删除确认
- **高级功能**：
  - **分页查询**：服务端分页，每页 10 条，支持自定义
  - **智能筛选**：
    - 搜索框：标题、URL、描述全文搜索
    - 分类筛选：下拉选择分类标签
  - **灵活排序**：
    - 按创建时间排序（默认）
    - 按点击量排序
    - 按标题字母排序
    - 升序/降序切换
  - **分类管理**：自定义分类标签
  - **访问统计**：记录每个链接的点击次数
  - **可见性控制**：公开/私密切换
- **表格样式**：
  - 传统表格布局，信息密度高
  - 响应式设计，支持横向滚动
  - 悬停高亮，操作便捷

📖 详细文档：[链接管理 API](./docs/LINK_GUIDE.md) | [分页功能](./docs/PAGINATION_FEATURE.md)

### 🔐 用户认证
- **注册系统**：
  - 邮箱 + 密码注册
  - 密码强度实时检测
  - 邮箱格式验证
  - 密码确认匹配
- **登录系统**：
  - 邮箱 + 密码登录
  - 测试账号快速登录
  - 错误提示友好
- **JWT 认证**：
  - 访问令牌（Access Token）：1 小时有效
  - 刷新令牌（Refresh Token）：7 天有效
  - 自动令牌刷新机制
- **密码安全**：
  - bcrypt 加密存储
  - 密码修改功能
  - 需验证原密码
- **状态持久化**：
  - localStorage 存储令牌
  - 页面刷新状态保持
  - 自动登录恢复

📖 详细文档：[认证功能指南](./docs/AUTH_GUIDE.md)

### 🎛️ 管理后台
- **数据概览仪表板**：
  - 统计卡片：总链接数、总点击量、公开链接数
  - 最近活动：最新添加的 5 个链接
  - 热门内容：按点击量排序的 TOP 5
- **个人信息管理**：
  - 编辑资料：姓名、头像上传
  - 修改密码：需验证原密码
  - 账户信息：邮箱、注册时间展示
- **链接管理中心**：
  - **表格布局**：清晰的数据展示
  - **分页功能**：每页 10 条，支持跳页
  - **搜索筛选**：全文搜索 + 分类筛选
  - **排序功能**：多字段排序，升降序切换
  - **批量操作**：快速编辑和删除
  - **模态框交互**：友好的新增/编辑体验
- **关于页面**：
  - 应用信息展示
  - 版本号和技术栈
  - 功能特色介绍
- **路由保护**：
  - 认证中间件自动检查
  - 未登录自动跳转登录页
  - 登录后返回原页面

📖 详细文档：[管理后台指南](./docs/ADMIN_GUIDE.md)

## ⚙️ 配置说明

### 数据库配置

项目使用 Prisma 作为 ORM 工具，数据库模型定义在 `prisma/schema.prisma` 文件中。

#### 数据模型

```prisma
// 用户模型
model User {
  id          Int      @id @default(autoincrement())
  email       String   @unique
  password    String
  name        String?
  avatar      String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  links       Link[]
}

// 链接模型
model Link {
  id          Int      @id @default(autoincrement())
  url         String
  title       String
  description String?
  icon        String?
  category    String?
  isPublic    Boolean  @default(false)
  clicks      Int      @default(0)
  userId      Int
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([userId])
  @@index([isPublic])
  @@index([category])
}
```

#### 可用命令

- `pnpm db:push` - 快速推送数据库模型（开发环境推荐）
- `pnpm db:migrate` - 创建迁移文件（生产环境推荐）
- `pnpm db:studio` - 打开 Prisma Studio 可视化管理界面
- `pnpm db:seed` - 执行数据库种子文件，创建测试数据
- `pnpm prisma:generate` - 重新生成 Prisma Client

#### 配置数据库连接

需要在项目根目录创建 `.env` 文件（已在 .gitignore 中忽略）：

**MySQL（推荐用于生产环境）**：

```env
DATABASE_URL="mysql://用户名:密码@主机:端口/数据库名?sslaccept=strict"
```

**SQLite（适合开发环境）**：

```env
DATABASE_URL="file:./dev.db"
```

**其他数据库**：
- **PostgreSQL**: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require`
- **SQL Server**: `sqlserver://HOST:PORT;database=DATABASE;user=USER;password=PASSWORD`

修改数据库类型后，需要在 `prisma/schema.prisma` 中修改 `provider` 字段。

### VueUse 集成

自动导入 VueUse 的 Composition API 工具函数，项目中使用的包括：
- `useDebounceFn` - 函数防抖
- `useThrottleFn` - 函数节流
- `useLocalStorage` - 本地存储
- 更多功能参考 [VueUse 文档](https://vueuse.org/)

### Composables 说明

项目使用 Vue 3 Composition API 编写了多个可复用的组合式函数：

- **useAuth**: 认证状态管理（登录、登出、用户信息）
- **useLinks**: 链接管理（CRUD、分页、统计）
- **useSearch**: 搜索功能（历史、建议、匹配）
- **useHotboard**: 热榜数据管理（缓存、平台切换）

所有 composables 都支持 SSR，并有完整的类型定义。

## 📚 学习资源

### 官方文档
- [Nuxt 4 文档](https://nuxt.com/docs/getting-started/introduction) - 全栈框架
- [Nuxt UI 文档](https://ui.nuxt.com/) - UI 组件库
- [Prisma 文档](https://www.prisma.io/docs) - ORM 工具
- [VueUse 文档](https://vueuse.org/) - Composition API 工具集
- [Vue 3 文档](https://vuejs.org/) - 前端框架
- [TypeScript 文档](https://www.typescriptlang.org/) - 类型系统

### 项目文档
- [📖 Prisma 使用指南](./docs/PRISMA_GUIDE.md) - 数据库操作详细教程
- [🔐 认证功能文档](./docs/AUTH_GUIDE.md) - 完整的认证系统使用指南
- [🔗 链接管理 API](./docs/LINK_GUIDE.md) - 链接管理接口文档
- [📄 分页功能说明](./docs/PAGINATION_FEATURE.md) - 分页实现原理与使用
- [🔍 搜索功能文档](./docs/SEARCH_SUGGESTIONS.md) - 智能搜索实现
- [🔥 搜索引擎 API](./docs/SEARCH_ENGINE_API.md) - 外部 API 集成
- [⭐ 网页推荐功能](./docs/PUBLIC_LINKS_FEATURE.md) - 公开分享机制
- [🎛️ 管理后台指南](./docs/ADMIN_GUIDE.md) - 完整的后台管理系统
- [💾 数据导入导出](./docs/IMPORT_EXPORT_GUIDE.md) - 备份和迁移数据
- [📊 功能总结](./docs/FEATURES_SUMMARY.md) - 所有功能概览

## 🎯 开发计划

### 已完成 ✅
- [x] 用户认证系统（注册/登录/JWT）
- [x] 链接管理（CRUD 完整功能）
- [x] 分页查询（服务端分页）
- [x] 搜索功能（多引擎 + 建议）
- [x] 热点榜单（50+ 平台）
- [x] 网页推荐（公开分享）
- [x] 管理后台（完整 UI）
- [x] 表格样式列表
- [x] 深色模式支持
- [x] 数据导入导出（备份和迁移）

### 计划中 🚧
- [ ] 链接标签系统
- [ ] 用户关注系统
- [ ] 链接评论功能
- [ ] 数据统计图表
- [ ] 移动端 PWA
- [ ] 国际化支持
- [ ] 搜索引擎优化（SEO）

## 🤝 贡献指南

欢迎贡献代码、报告 Bug 或提出新功能建议！

### 开发流程
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范
- 使用 TypeScript 编写代码
- 遵循 Vue 3 Composition API 最佳实践
- 编写清晰的注释和文档
- 确保代码通过 ESLint 检查

## 📝 许可证

MIT License

---

<div align="center">
  <sub>使用 ❤️ 和 Nuxt 4 构建</sub>
</div>
