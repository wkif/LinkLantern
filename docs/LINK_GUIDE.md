# 🔗 链接收藏功能文档

## 📋 概述

LinkLantern 是一个个人网页导航应用，用户登录后可以收藏和管理自己的网站链接。

## 🗄️ 数据模型

### Link 模型

```prisma
model Link {
  id          Int      @id @default(autoincrement())
  url         String                                  // 链接地址
  title       String                                  // 网站标题
  description String?                                 // 描述（可选）
  icon        String?                                 // 图标/favicon URL（可选）
  category    String?                                 // 分类（可选）
  isPublic    Boolean  @default(false)               // 是否公开
  clicks      Int      @default(0)                   // 点击次数
  userId      Int                                     // 所属用户ID
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User     @relation(...)                // 关联到用户
}
```

## 🔧 API 接口

### 1. 获取用户的所有链接

**接口：** `GET /api/links`

**需要认证：** ✅

**查询参数：**
- `category` (可选) - 按分类筛选
- `search` (可选) - 搜索标题或描述

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "url": "https://github.com",
      "title": "GitHub",
      "description": "全球最大的代码托管平台",
      "icon": "https://github.githubassets.com/favicons/favicon.svg",
      "category": "开发工具",
      "isPublic": true,
      "clicks": 10,
      "userId": 1,
      "createdAt": "2026-01-14T08:00:00.000Z",
      "updatedAt": "2026-01-14T08:00:00.000Z"
    }
  ]
}
```

---

### 2. 创建新链接

**接口：** `POST /api/links`

**需要认证：** ✅

**请求体：**
```json
{
  "url": "https://example.com",        // 必填
  "title": "示例网站",                  // 必填
  "description": "这是一个示例网站",     // 可选
  "icon": "https://example.com/favicon.ico",  // 可选
  "category": "工具",                   // 可选
  "isPublic": false                     // 可选，默认 false
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "链接创建成功",
  "data": {
    "id": 1,
    "url": "https://example.com",
    "title": "示例网站",
    "description": "这是一个示例网站",
    "icon": "https://example.com/favicon.ico",
    "category": "工具",
    "isPublic": false,
    "clicks": 0,
    "userId": 1,
    "createdAt": "2026-01-14T08:00:00.000Z",
    "updatedAt": "2026-01-14T08:00:00.000Z"
  }
}
```

---

### 3. 获取单个链接详情

**接口：** `GET /api/links/:id`

**需要认证：** ✅

**权限：** 只能查看自己的链接

**响应示例：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "url": "https://github.com",
    "title": "GitHub",
    "description": "全球最大的代码托管平台",
    "icon": "https://github.githubassets.com/favicons/favicon.svg",
    "category": "开发工具",
    "isPublic": true,
    "clicks": 10,
    "userId": 1,
    "createdAt": "2026-01-14T08:00:00.000Z",
    "updatedAt": "2026-01-14T08:00:00.000Z"
  }
}
```

---

### 4. 更新链接

**接口：** `PUT /api/links/:id`

**需要认证：** ✅

**权限：** 只能更新自己的链接

**请求体：**（所有字段都是可选的）
```json
{
  "url": "https://newurl.com",
  "title": "新标题",
  "description": "新描述",
  "icon": "https://newurl.com/icon.png",
  "category": "新分类",
  "isPublic": true
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "链接更新成功",
  "data": {
    "id": 1,
    "url": "https://newurl.com",
    "title": "新标题",
    // ... 其他字段
  }
}
```

---

### 5. 删除链接

**接口：** `DELETE /api/links/:id`

**需要认证：** ✅

**权限：** 只能删除自己的链接

**响应示例：**
```json
{
  "success": true,
  "message": "链接删除成功"
}
```

---

### 6. 记录链接点击

**接口：** `POST /api/links/:id/click`

**需要认证：** ✅

**权限：** 只能点击自己的链接

**响应示例：**
```json
{
  "success": true,
  "data": {
    "clicks": 11
  }
}
```

---

### 7. 获取统计信息

**接口：** `GET /api/links/stats`

**需要认证：** ✅

**响应示例：**
```json
{
  "success": true,
  "data": {
    "total": 10,
    "totalClicks": 150,
    "categories": {
      "开发工具": 5,
      "设计工具": 2,
      "生产力": 3
    }
  }
}
```

## 🧪 使用示例

### 前端集成示例

```typescript
// composables/useLinks.ts
export const useLinks = () => {
  const token = localStorage.getItem('accessToken')
  
  // 获取所有链接
  const getLinks = async (category?: string, search?: string) => {
    const params = new URLSearchParams()
    if (category) params.append('category', category)
    if (search) params.append('search', search)
    
    const { data } = await $fetch(`/api/links?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return data
  }
  
  // 创建链接
  const createLink = async (linkData) => {
    const { data } = await $fetch('/api/links', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: linkData
    })
    return data
  }
  
  // 更新链接
  const updateLink = async (id, linkData) => {
    const { data } = await $fetch(`/api/links/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: linkData
    })
    return data
  }
  
  // 删除链接
  const deleteLink = async (id) => {
    await $fetch(`/api/links/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
  }
  
  // 记录点击
  const recordClick = async (id) => {
    await $fetch(`/api/links/${id}/click`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
  }
  
  // 获取统计
  const getStats = async () => {
    const { data } = await $fetch('/api/links/stats', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return data
  }
  
  return {
    getLinks,
    createLink,
    updateLink,
    deleteLink,
    recordClick,
    getStats
  }
}
```

### curl 测试示例

```bash
# 1. 先登录获取 token
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}' \
  | jq -r '.data.tokens.accessToken')

# 2. 获取所有链接
curl http://localhost:3000/api/links \
  -H "Authorization: Bearer $TOKEN"

# 3. 创建新链接
curl -X POST http://localhost:3000/api/links \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.google.com",
    "title": "Google",
    "description": "搜索引擎",
    "category": "工具"
  }'

# 4. 更新链接（假设 ID 为 1）
curl -X PUT http://localhost:3000/api/links/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Google 搜索"}'

# 5. 删除链接
curl -X DELETE http://localhost:3000/api/links/1 \
  -H "Authorization: Bearer $TOKEN"

# 6. 记录点击
curl -X POST http://localhost:3000/api/links/1/click \
  -H "Authorization: Bearer $TOKEN"

# 7. 获取统计
curl http://localhost:3000/api/links/stats \
  -H "Authorization: Bearer $TOKEN"
```

## 📊 测试数据

运行 `pnpm db:seed` 后，会创建以下测试链接：

**Alice 的链接（5个）：**
- GitHub (开发工具)
- Stack Overflow (开发工具)
- Figma (设计工具)
- Notion (生产力)
- ChatGPT (AI工具)

**Bob 的链接（3个）：**
- YouTube (娱乐)
- Netflix (娱乐)
- Twitter (社交)

## 🎯 功能特性

- ✅ **链接管理** - 完整的 CRUD 操作
- ✅ **分类管理** - 按分类组织链接
- ✅ **搜索功能** - 搜索标题和描述
- ✅ **点击统计** - 记录链接访问次数
- ✅ **隐私控制** - 设置链接是否公开
- ✅ **用户隔离** - 每个用户只能管理自己的链接
- ✅ **统计报表** - 查看链接和分类统计

## 💡 使用建议

### 1. 获取网站图标

可以使用以下服务自动获取网站图标：

```javascript
// 方法 1: Google Favicon Service
const getIcon = (url) => {
  const domain = new URL(url).hostname
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
}

// 方法 2: Favicon.io
const getIcon = (url) => {
  return `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=128`
}
```

### 2. 分类建议

推荐的分类：
- 开发工具
- 设计工具
- 生产力
- 学习资源
- 娱乐
- 社交
- 新闻
- 购物
- AI工具

### 3. 搜索优化

```typescript
// 防抖搜索
const searchLinks = useDebounceFn(async (keyword) => {
  const links = await getLinks(undefined, keyword)
  // 更新显示
}, 300)
```

## 🔒 权限说明

- 用户只能查看、编辑、删除自己创建的链接
- 其他用户无法访问私有链接（`isPublic: false`）
- 所有链接操作都需要 JWT 认证

## 📚 相关文档

- [认证功能文档](./AUTH_GUIDE.md) - 用户认证系统
- [Prisma 使用指南](./PRISMA_GUIDE.md) - 数据库操作

## 🚀 下一步

您可以：
1. 创建前端页面展示链接
2. 实现拖拽排序功能
3. 添加链接导入/导出功能
4. 实现公开链接分享功能
5. 添加链接预览功能

