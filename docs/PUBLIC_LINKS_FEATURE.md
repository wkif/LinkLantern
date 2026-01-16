# 网页推荐功能说明

## 功能概述

"网页推荐"功能允许用户浏览其他用户公开分享的优质链接，促进内容发现和社区共享。

## 主要特性

### 1. 公开链接展示
- ✅ 显示所有用户设置为 `isPublic: true` 的链接
- ✅ 所有用户（包括未登录用户）都可以查看
- ✅ 精美的卡片式布局，与"我的链接"风格一致

### 2. 排序方式
用户可以选择两种排序方式：

- **热门排序** 🔥：按链接点击量（`clicks`）降序排列
- **最新排序** 🕒：按创建时间（`createdAt`）降序排列

> **注意**：由于每个用户的链接分类标签都是自定义的，网页推荐功能不提供分类筛选，以保持推荐内容的广泛性和多样性。

### 3. 隐私保护
为保护用户隐私，分享者信息进行了脱敏处理：
- 显示用户名（如果未设置则显示"匿名用户"）
- 邮箱地址隐藏中间部分
  - 示例：`example@gmail.com` → `e****e@gmail.com`

### 4. 统计信息
每个公开链接卡片显示：
- 点击次数
- 分享者信息
- 链接分类
- "公开分享"标识

## API 接口

### GET /api/links/public

获取公开链接列表。

**查询参数：**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `sort` | string | 否 | `popular` | 排序方式：`popular`（热门）或 `recent`（最新） |
| `limit` | number | 否 | `20` | 返回数量限制 |

**响应示例：**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "url": "https://example.com",
      "title": "示例网站",
      "description": "这是一个示例网站",
      "icon": "https://example.com/favicon.ico",
      "category": "工具",
      "clicks": 42,
      "createdAt": "2026-01-14T10:00:00.000Z",
      "updatedAt": "2026-01-14T10:00:00.000Z",
      "sharedBy": {
        "id": 1,
        "name": "张三",
        "email": "z****3@gmail.com"
      }
    }
  ],
  "total": 1,
  "sort": "popular"
}
```

## 前端实现

### Composable: useLinks

新增功能：

```typescript
// 获取公开链接
const { publicLinks, loadingPublic, fetchPublicLinks } = useLinks()

// 调用示例
await fetchPublicLinks({ 
  sort: 'popular',  // 或 'recent'
  limit: 12
})
```

### 页面展示

在首页（`app/pages/index.vue`）中：

1. **位置**：在"我的链接"部分之后
2. **可见性**：所有用户都可见（包括未登录用户）
3. **加载时机**：页面挂载时自动加载

## UI 设计

### 布局特点

- 响应式网格布局：
  - 移动端：1列
  - 平板：2列
  - 桌面：3-4列
- 卡片悬停效果：阴影和缩放动画
- 渐变色背景：绿色到蓝色（区别于"我的链接"的蓝色到紫色）
- 排序按钮：热门和最新两种排序方式

### 交互设计

1. **排序切换**：点击"热门"或"最新"按钮
2. **查看链接**：点击卡片在新标签页打开
3. **提示信息**：引导未登录用户注册

## 隐私保护实现

### 邮箱脱敏函数

```typescript
function maskEmail(email: string): string {
  const [username, domain] = email.split('@')
  if (username.length <= 2) {
    return `${username[0]}****@${domain}`
  }
  const firstChar = username[0]
  const lastChar = username[username.length - 1]
  return `${firstChar}****${lastChar}@${domain}`
}
```

**示例：**
- `example@gmail.com` → `e****e@gmail.com`
- `ab@test.com` → `a****@test.com`
- `john.doe@company.com` → `j****e@company.com`

## 数据库查询

```typescript
const links = await prisma.link.findMany({
  where: {
    isPublic: true,
  },
  orderBy: {
    clicks: 'desc', // 或 createdAt: 'desc'
  },
  take: limit,
  include: {
    user: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
  },
})
```

## 使用场景

### 场景 1：发现优质内容
- 用户浏览热门推荐，发现其他人分享的有用链接
- 按分类查找特定类型的资源

### 场景 2：社区共享
- 用户将自己的优质链接设置为公开
- 帮助他人发现有价值的网站

### 场景 3：引流注册
- 未登录用户看到推荐内容
- 提示信息引导用户注册并分享自己的链接

## 后续优化建议

### 功能增强
1. **点赞系统**：允许用户为公开链接点赞
2. **评论功能**：用户可以评论和讨论公开链接
3. **关注系统**：关注其他用户，查看他们的公开分享
4. **标签系统**：支持多标签筛选，更精准的分类

### 性能优化
1. **分页加载**：支持无限滚动或分页
2. **缓存策略**：缓存热门推荐，减少数据库查询
3. **CDN加速**：链接图标使用CDN加速

### 内容质量
1. **审核机制**：管理员可以审核公开链接
2. **举报功能**：用户可以举报不当内容
3. **质量评分**：根据点击率、点赞数等计算质量分

## 注意事项

1. **隐私保护**：确保用户邮箱等敏感信息不被完整暴露
2. **内容安全**：防止恶意链接或不当内容
3. **性能考虑**：大量数据时需要分页和缓存
4. **用户体验**：加载状态和空状态的友好提示

## 技术栈

- **后端**：Nuxt Server API (Nitro)
- **数据库**：Prisma + MySQL
- **前端**：Vue 3 Composition API
- **UI组件**：Nuxt UI
- **状态管理**：Composables

## 测试建议

### 测试用例

1. ✅ 未登录用户可以查看公开链接
2. ✅ 已登录用户可以查看公开链接
3. ✅ 热门排序功能正常
4. ✅ 最新排序功能正常
5. ✅ 分类筛选功能正常
6. ✅ 邮箱脱敏正确
7. ✅ 点击链接正常打开
8. ✅ 空状态显示正常
9. ✅ 加载状态显示正常
10. ✅ 响应式布局在不同屏幕下正常

## 总结

"网页推荐"功能为 LinkLantern 增加了社交属性，让用户不仅可以管理自己的链接，还能发现和分享优质内容。通过合理的隐私保护和精美的UI设计，这个功能将大大提升产品的价值和用户粘性。

