# Vercel 部署指南

本文档说明如何将 LinkLantern 部署到 Vercel。

## 📋 前置准备

1. **GitHub 账号**：将代码推送到 GitHub 仓库
2. **Vercel 账号**：在 [vercel.com](https://vercel.com) 注册账号
3. **数据库**：准备 MySQL 数据库（推荐使用 PlanetScale、Railway 或其他云数据库服务）

## 🚀 部署步骤

### 1. 准备数据库

推荐使用以下云数据库服务之一：

- **PlanetScale**：免费套餐，MySQL 兼容
- **Railway**：支持多种数据库，简单易用
- **Supabase**：PostgreSQL 数据库
- **TiDB Cloud**：分布式数据库

获取数据库连接字符串，格式如：
```
mysql://username:password@host:port/database?sslaccept=strict
```

### 2. 在 Vercel 中导入项目

1. 访问 [vercel.com/new](https://vercel.com/new)
2. 选择你的 GitHub 仓库
3. 点击 "Import"

### 3. 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

#### 必需的环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | 数据库连接字符串 | `mysql://user:pass@host:3306/db` |
| `JWT_SECRET` | JWT 访问令牌密钥 | `your-super-secret-key-here` |
| `JWT_REFRESH_SECRET` | JWT 刷新令牌密钥 | `your-refresh-secret-key-here` |

#### 可选的环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `JWT_EXPIRES_IN` | 访问令牌有效期 | `1h` |
| `JWT_REFRESH_EXPIRES_IN` | 刷新令牌有效期 | `7d` |

#### 设置步骤

1. 进入你的 Vercel 项目页面
2. 点击 "Settings" → "Environment Variables"
3. 添加环境变量：
   - **Name**: 输入变量名（如 `DATABASE_URL`）
   - **Value**: 输入变量值
   - **Environment**: 选择应用的环境
     - ✅ Production（生产环境）
     - ✅ Preview（预览环境，可选）
     - ✅ Development（开发环境，可选）
4. 点击 "Save" 保存

**重要提示**：
- 生产环境的 JWT 密钥必须使用强随机字符串
- 不要在代码中硬编码敏感信息
- 修改环境变量后需要重新部署才能生效

### 4. 部署项目

1. 配置完环境变量后，点击 "Deploy"
2. Vercel 会自动执行以下步骤：
   - 安装依赖
   - 生成 Prisma Client
   - 运行数据库迁移
   - 构建 Nuxt 应用

### 5. 运行数据库迁移

首次部署后，需要初始化数据库：

**方式 1：使用 Vercel CLI**

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 链接项目
vercel link

# 运行迁移
vercel env pull .env.local
npx prisma migrate deploy
```

**方式 2：手动执行**

```bash
# 设置 DATABASE_URL 环境变量
export DATABASE_URL="your-database-url"

# 运行迁移
npx prisma migrate deploy
```

## 🔧 构建配置说明

### package.json

关键的构建脚本：

```json
{
  "scripts": {
    "build": "prisma generate && nuxt build",
    "postinstall": "prisma generate",
    "vercel-build": "prisma generate && prisma migrate deploy && nuxt build"
  }
}
```

- `postinstall`: 安装依赖后自动生成 Prisma Client
- `build`: 标准构建命令
- `vercel-build`: Vercel 部署专用，包含迁移

### nuxt.config.ts

Vercel 优化配置：

```typescript
export default defineNuxtConfig({
  nitro: {
    preset: 'vercel',
    externals: {
      inline: ['@prisma/client']
    }
  }
})
```

### vercel.json

简化的构建配置：

```json
{
  "buildCommand": "prisma generate && nuxt build"
}
```

**说明**：
- 环境变量通过 Vercel UI 设置，不需要在配置文件中引用
- `buildCommand` 确保在构建前生成 Prisma Client

## 🐛 常见问题

### 1. Prisma Client 导入错误

**错误信息**：
```
SyntaxError: Named export 'PrismaClient' not found
```

**解决方案**：
使用 CommonJS 兼容的导入方式：

```typescript
// ✅ 正确
import pkg from '@prisma/client'
const { PrismaClient } = pkg

// ❌ 错误
import { PrismaClient } from '@prisma/client'
```

### 2. __dirname 未定义错误

**错误信息**：
```
ReferenceError: __dirname is not defined in ES module scope
```

**解决方案**：
已在配置中添加 Prisma 二进制目标和模块别名：

```typescript
// nuxt.config.ts
nitro: {
  preset: 'vercel',
  moduleSideEffects: ['@prisma/client'],
  alias: {
    '.prisma/client': './node_modules/.prisma/client'
  }
}
```

并在 `prisma/schema.prisma` 中添加：

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-1.0.x", "debian-openssl-1.1.x"]
}
```

### 3. 数据库连接失败

**检查清单**：
- ✅ DATABASE_URL 环境变量是否正确设置
- ✅ 数据库是否允许外部连接
- ✅ 连接字符串格式是否正确
- ✅ 数据库防火墙规则是否允许 Vercel IP

### 4. 构建超时

**解决方案**：
- 检查 `package.json` 中的 `postinstall` 脚本
- 确保 Prisma Client 正确生成
- 考虑升级 Vercel 套餐以获得更多构建时间

### 5. 环境变量未生效

**检查清单**：
- ✅ 变量名是否正确（区分大小写）
- ✅ 是否选择了正确的环境（Production/Preview/Development）
- ✅ 修改环境变量后是否重新部署

## 📊 部署后验证

部署成功后，验证以下功能：

1. **访问首页**：检查页面是否正常加载
2. **用户注册**：创建新账户
3. **用户登录**：使用注册的账户登录
4. **链接管理**：添加、编辑、删除链接
5. **搜索功能**：测试搜索和建议
6. **热点榜单**：检查榜单数据加载

## 🔒 安全建议

1. **JWT 密钥**：
   - 使用强随机字符串
   - 不要在代码中硬编码
   - 定期更换密钥

2. **数据库**：
   - 使用 SSL 连接
   - 限制数据库访问 IP
   - 定期备份数据

3. **环境变量**：
   - 不要提交 `.env` 文件到 Git
   - 使用 Vercel 环境变量管理
   - 区分生产和开发环境

## 📝 更新部署

### 自动部署

推送到 GitHub 主分支后，Vercel 会自动触发部署：

```bash
git add .
git commit -m "Update feature"
git push origin main
```

### 手动部署

使用 Vercel CLI：

```bash
vercel --prod
```

## 🎯 优化建议

1. **添加自定义域名**：
   - 在 Vercel 项目设置中添加域名
   - 配置 DNS 记录

2. **启用分析**：
   - 使用 Vercel Analytics 监控性能
   - 查看访问统计和错误日志

3. **配置 CORS**：
   - 如果需要跨域访问，在 Nitro 配置中添加 CORS 头

4. **添加 CDN 缓存**：
   - 使用 Vercel Edge Network 加速静态资源

## 📚 相关资源

- [Vercel 官方文档](https://vercel.com/docs)
- [Nuxt 部署文档](https://nuxt.com/docs/getting-started/deployment)
- [Prisma 部署指南](https://www.prisma.io/docs/guides/deployment)
- [PlanetScale 使用教程](https://planetscale.com/docs)

## 🆘 获取帮助

遇到问题时：

1. 查看 Vercel 构建日志
2. 检查函数运行日志
3. 参考本文档的常见问题部分
4. 在项目 GitHub Issues 中提问

---

祝你部署顺利！🎉

