# Prisma 使用指南

## 📚 什么是 Prisma？

Prisma 是一个现代化的数据库 ORM 工具，它可以让您：
- 使用 TypeScript 类型安全地操作数据库
- 自动生成数据库查询代码
- 可视化管理数据库数据
- 支持多种数据库（MySQL、PostgreSQL、SQLite 等）

## 🚀 快速开始

### 1. 配置数据库连接

在项目根目录创建 `.env` 文件：

```env
DATABASE_URL="mysql://用户名:密码@主机:端口/数据库名?sslaccept=strict"
```

### 2. 定义数据模型

编辑 `prisma/schema.prisma` 文件：

```prisma
model Post {
  id        Int      @id @default(autoincrement())
  title     String   @db.VarChar(255)
  content   String?  @db.Text
  published Boolean  @default(false)
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique @db.VarChar(255)
  name      String?  @db.VarChar(255)
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 3. 推送数据库模型

```bash
pnpm db:push
```

### 4. 在 API 中使用

在 `app/server/api/` 中创建 API 路由：

```typescript
// app/server/api/posts.get.ts
import prisma from '~/utils/prisma'

export default defineEventHandler(async () => {
  const posts = await prisma.post.findMany({
    include: {
      author: true  // 包含关联的用户信息
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  
  return { success: true, data: posts }
})
```

## 📖 常用操作

### 查询数据

```typescript
// 查询所有
const users = await prisma.user.findMany()

// 条件查询
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' }
})

// 复杂查询
const posts = await prisma.post.findMany({
  where: {
    published: true,
    author: {
      email: { contains: '@example.com' }
    }
  },
  include: { author: true },
  orderBy: { createdAt: 'desc' },
  take: 10  // 限制返回 10 条
})
```

### 创建数据

```typescript
// 创建单条
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: '用户名'
  }
})

// 创建并关联
const post = await prisma.post.create({
  data: {
    title: '文章标题',
    content: '文章内容',
    author: {
      connect: { id: userId }  // 关联已存在的用户
    }
  }
})
```

### 更新数据

```typescript
// 更新单条
const user = await prisma.user.update({
  where: { id: 1 },
  data: { name: '新名字' }
})

// 更新多条
const result = await prisma.post.updateMany({
  where: { published: false },
  data: { published: true }
})
```

### 删除数据

```typescript
// 删除单条
await prisma.user.delete({
  where: { id: 1 }
})

// 删除多条
await prisma.post.deleteMany({
  where: { published: false }
})
```

## 🎯 实用技巧

### 1. 事务处理

```typescript
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: { email: 'user@example.com' }
  })
  
  const post = await tx.post.create({
    data: {
      title: '文章',
      authorId: user.id
    }
  })
  
  return { user, post }
})
```

### 2. 计数和聚合

```typescript
// 计数
const count = await prisma.user.count()

// 聚合
const result = await prisma.post.aggregate({
  _count: true,
  _avg: { views: true },
  _max: { createdAt: true }
})
```

### 3. 原始 SQL 查询

```typescript
const users = await prisma.$queryRaw`
  SELECT * FROM User WHERE email LIKE ${`%${keyword}%`}
`
```

## 🔧 常用命令

```bash
# 生成 Prisma Client
pnpm prisma:generate

# 推送数据库模型（开发环境）
pnpm db:push

# 创建迁移（生产环境）
pnpm db:migrate

# 打开可视化管理界面
pnpm db:studio

# 格式化 schema 文件
pnpm exec prisma format

# 验证 schema 文件
pnpm exec prisma validate
```

## 📚 更多资源

- [Prisma 官方文档](https://www.prisma.io/docs)
- [Prisma 数据模型](https://www.prisma.io/docs/concepts/components/prisma-schema/data-model)
- [Prisma Client API](https://www.prisma.io/docs/concepts/components/prisma-client)
- [Prisma 迁移指南](https://www.prisma.io/docs/concepts/components/prisma-migrate)

## 🆘 常见问题

### 如何修改数据库结构？

1. 修改 `prisma/schema.prisma` 文件
2. 运行 `pnpm db:push` 推送更改

### 如何重置数据库？

```bash
pnpm exec prisma migrate reset
```

⚠️ 注意：这会删除所有数据！

### 如何查看生成的 SQL？

启动开发服务器时添加日志：

```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})
```

