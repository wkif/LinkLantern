# 🔐 用户认证功能文档

## 📋 概述

本项目已集成完整的用户认证功能，包括：
- ✅ 用户注册
- ✅ 用户登录
- ✅ JWT 令牌认证
- ✅ 密码加密（bcrypt）
- ✅ 获取和更新用户信息
- ✅ 受保护的 API 路由

## 🗄️ 数据模型

### User 模型

```prisma
model User {
  id            Int       @id @default(autoincrement())
  email         String    @unique                       // 邮箱（唯一）
  password      String                                  // 加密后的密码
  name          String?                                 // 用户名（可选）
  avatar        String?                                 // 头像 URL（可选）
  isActive      Boolean   @default(true)                // 账户是否激活
  emailVerified Boolean   @default(false)               // 邮箱是否验证
  lastLoginAt   DateTime?                               // 最后登录时间
  createdAt     DateTime  @default(now())               // 创建时间
  updatedAt     DateTime  @updatedAt                    // 更新时间
}
```

## 🔧 API 接口

### 1. 用户注册

**接口：** `POST /api/auth/register`

**请求体：**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "用户名"  // 可选
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "用户名",
      "avatar": null,
      "isActive": true,
      "emailVerified": false,
      "createdAt": "2026-01-14T08:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**验证规则：**
- 邮箱必须符合标准格式
- 密码长度至少 6 个字符
- 邮箱不能重复注册

---

### 2. 用户登录

**接口：** `POST /api/auth/login`

**请求体：**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "用户名",
      "avatar": null,
      "isActive": true,
      "emailVerified": false,
      "lastLoginAt": "2026-01-14T08:00:00.000Z",
      "createdAt": "2026-01-14T07:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

---

### 3. 获取当前用户信息

**接口：** `GET /api/auth/me`

**请求头：**
```
Authorization: Bearer <accessToken>
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "用户名",
    "avatar": null,
    "isActive": true,
    "emailVerified": false,
    "lastLoginAt": "2026-01-14T08:00:00.000Z",
    "createdAt": "2026-01-14T07:00:00.000Z",
    "updatedAt": "2026-01-14T08:00:00.000Z"
  }
}
```

---

### 4. 更新当前用户信息

**接口：** `PUT /api/auth/me`

**请求头：**
```
Authorization: Bearer <accessToken>
```

**请求体：**
```json
{
  "name": "新用户名",      // 可选
  "avatar": "https://..."  // 可选
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "更新成功",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "新用户名",
    "avatar": "https://...",
    "isActive": true,
    "emailVerified": false,
    "lastLoginAt": "2026-01-14T08:00:00.000Z",
    "createdAt": "2026-01-14T07:00:00.000Z",
    "updatedAt": "2026-01-14T08:05:00.000Z"
  }
}
```

## 🔑 JWT 令牌

### 令牌配置

- **访问令牌（Access Token）**：有效期 1 小时
- **刷新令牌（Refresh Token）**：有效期 7 天

### 环境变量配置

在 `.env` 文件中可以配置以下变量：

```env
# JWT 密钥（生产环境必须修改！）
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key

# JWT 有效期
JWT_EXPIRES_IN=1h          # 访问令牌：1小时
JWT_REFRESH_EXPIRES_IN=7d  # 刷新令牌：7天
```

### 使用方式

在前端请求时，将令牌放在请求头中：

```javascript
fetch('/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})
```

## 🛡️ 认证中间件

### 使用方式

在需要保护的 API 路由中使用认证中间件：

```typescript
import { requireAuth } from '~/server/middleware/auth'

export default defineEventHandler(async (event) => {
  // 验证用户身份
  const user = await requireAuth(event)
  
  // user.userId - 用户 ID
  // user.email - 用户邮箱
  
  // 你的业务逻辑...
})
```

### 可选认证

如果 API 允许用户登录或不登录都可以访问：

```typescript
import { optionalAuth } from '~/server/middleware/auth'

export default defineEventHandler(async (event) => {
  // 尝试获取用户信息（如果有令牌）
  const user = await optionalAuth(event)
  
  if (user) {
    // 用户已登录
  } else {
    // 用户未登录
  }
})
```

## 📝 使用示例

### 前端完整示例（使用 Fetch API）

```typescript
// 1. 注册
async function register() {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'user@example.com',
      password: 'password123',
      name: '用户名'
    })
  })
  
  const data = await response.json()
  
  if (data.success) {
    // 保存令牌
    localStorage.setItem('accessToken', data.data.tokens.accessToken)
    localStorage.setItem('refreshToken', data.data.tokens.refreshToken)
  }
}

// 2. 登录
async function login() {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'user@example.com',
      password: 'password123'
    })
  })
  
  const data = await response.json()
  
  if (data.success) {
    localStorage.setItem('accessToken', data.data.tokens.accessToken)
    localStorage.setItem('refreshToken', data.data.tokens.refreshToken)
  }
}

// 3. 获取用户信息
async function getCurrentUser() {
  const token = localStorage.getItem('accessToken')
  
  const response = await fetch('/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  const data = await response.json()
  return data.data
}

// 4. 更新用户信息
async function updateProfile() {
  const token = localStorage.getItem('accessToken')
  
  const response = await fetch('/api/auth/me', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: '新名字',
      avatar: 'https://example.com/avatar.jpg'
    })
  })
  
  const data = await response.json()
  return data.data
}

// 5. 退出登录
function logout() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}
```

## 🧪 测试 API

### 使用 curl 测试

```bash
# 1. 注册用户
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "测试用户"
  }'

# 2. 登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# 3. 获取当前用户信息（需要替换 <TOKEN>）
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <TOKEN>"

# 4. 更新用户信息
curl -X PUT http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "新名字"
  }'
```

## 🔒 安全建议

1. **修改 JWT 密钥**
   - 在生产环境中，必须修改 `.env` 文件中的 `JWT_SECRET` 和 `JWT_REFRESH_SECRET`
   - 使用强随机字符串

2. **HTTPS**
   - 生产环境必须使用 HTTPS
   - 防止令牌在传输过程中被窃取

3. **密码强度**
   - 可以在 `app/utils/auth.ts` 中的 `validatePassword` 函数增加密码复杂度要求

4. **令牌存储**
   - 前端使用 httpOnly Cookie 存储令牌更安全
   - 避免使用 localStorage 存储敏感信息

5. **速率限制**
   - 建议添加登录尝试次数限制
   - 防止暴力破解

## 📊 测试数据

运行种子文件后，会创建以下测试用户：

| 邮箱 | 密码 | 用户名 | 邮箱验证 |
|------|------|--------|----------|
| alice@example.com | password123 | Alice | ✅ |
| bob@example.com | password123 | Bob | ✅ |
| charlie@example.com | password123 | Charlie | ❌ |

```bash
# 填充测试数据
pnpm db:seed
```

## 🆘 常见问题

### 1. 令牌过期怎么办？

访问令牌过期后，可以使用刷新令牌获取新的访问令牌（需要自己实现刷新令牌接口）。

### 2. 如何验证邮箱？

可以发送验证邮件，用户点击链接后更新 `emailVerified` 字段（需要自己实现邮件发送功能）。

### 3. 如何重置密码？

可以实现"忘记密码"功能，发送重置链接到用户邮箱（需要自己实现）。

### 4. 如何禁用用户？

更新用户的 `isActive` 字段为 `false`：

```typescript
await prisma.user.update({
  where: { id: userId },
  data: { isActive: false }
})
```

## 📚 相关文档

- [Prisma 使用指南](./PRISMA_GUIDE.md)
- [JWT 官方文档](https://jwt.io/)
- [bcrypt 文档](https://www.npmjs.com/package/bcryptjs)

