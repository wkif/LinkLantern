# 更新日志 - 首页自定义背景功能

**更新日期**: 2026-01-19  
**版本**: v1.1.0

## 🎉 新增功能

### 首页自定义背景

用户现在可以上传自定义图片作为首页背景，打造个性化的导航页面。

#### 主要特性

- ✅ 支持上传图片作为首页背景
- ✅ 背景图片以 base64 格式存储在数据库中
- ✅ 实时预览效果
- ✅ 支持删除和更换背景
- ✅ 自动适配明暗主题
- ✅ 响应式设计，适配所有屏幕尺寸

## 📋 技术实现

### 1. 数据库变更

**文件**: `prisma/schema.prisma`

在 User 模型中新增 `homeBackground` 字段：

```prisma
model User {
  // ... 其他字段
  homeBackground  String?   @db.LongText  // 首页背景图片（base64）
  // ... 其他字段
}
```

### 2. API 接口

新增三个背景管理接口：

#### a. 上传背景图片
**文件**: `server/api/auth/background.put.ts`

```typescript
PUT /api/auth/background
Authorization: Bearer {token}

// 请求体
{
  "background": "data:image/jpeg;base64,..."
}

// 响应
{
  "success": true,
  "message": "背景图片上传成功",
  "data": {
    "user": { ... }
  }
}
```

**功能**:
- 验证用户身份
- 验证 base64 格式
- 限制文件大小（4MB，避免超过数据库 6MB 限制）
- 更新数据库

#### b. 获取背景图片
**文件**: `server/api/auth/background.get.ts`

```typescript
GET /api/auth/background
Authorization: Bearer {token}

// 响应
{
  "success": true,
  "data": {
    "background": "data:image/jpeg;base64,..." | null
  }
}
```

#### c. 删除背景图片
**文件**: `server/api/auth/background.delete.ts`

```typescript
DELETE /api/auth/background
Authorization: Bearer {token}

// 响应
{
  "success": true,
  "message": "背景图片已删除",
  "data": {
    "user": { ... }
  }
}
```

### 3. Composable 更新

**文件**: `app/composables/useAuth.ts`

新增三个方法：

```typescript
// 更新首页背景
const updateHomeBackground = async (background: string)

// 删除首页背景
const deleteHomeBackground = async ()

// 获取首页背景
const getHomeBackground = async ()
```

更新 User 接口类型：

```typescript
export interface User {
  // ... 其他字段
  homeBackground?: string
  // ... 其他字段
}
```

### 4. 管理后台页面

**文件**: `app/pages/admin/settings.vue`

新增「首页背景设置」区域：

**功能**:
- 背景预览
- 上传背景按钮
- 更换背景按钮
- 删除背景按钮
- 文件选择处理
- 图片预处理和验证
- 使用提示信息

**限制**:
- 支持格式：JPG、PNG、GIF、WebP
- 文件大小：最大 4MB（数据库限制为 6MB，base64 编码后约 5.3MB）
- 建议分辨率：1920x1080 或更高
- **重要**：由于 TiDB Cloud 数据库最大条目限制为 6MB，原始文件限制为 4MB

### 5. 首页展示

**文件**: `app/pages/index.vue`

修改页面结构以支持背景显示：

```vue
<template>
  <div 
    class="min-h-screen relative"
    :class="{ 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800': !homeBackground }"
  >
    <!-- 自定义背景层 -->
    <div 
      v-if="homeBackground" 
      class="fixed inset-0 z-0"
      :style="{ backgroundImage: `url(${homeBackground})`, ... }"
    >
      <!-- 半透明遮罩层 -->
      <div class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"></div>
    </div>
    
    <!-- 页面内容 -->
    <main class="relative z-10">
      <!-- ... -->
    </main>
  </div>
</template>
```

**特性**:
- 使用 computed 响应式获取背景
- 固定定位，覆盖整个页面
- 半透明遮罩确保内容可读
- 模糊效果提升视觉体验

## 📝 文件变更清单

### 新增文件
- `server/api/auth/background.put.ts` - 上传背景接口
- `server/api/auth/background.get.ts` - 获取背景接口
- `server/api/auth/background.delete.ts` - 删除背景接口
- `docs/HOME_BACKGROUND_FEATURE.md` - 功能文档

### 修改文件
- `prisma/schema.prisma` - 数据库模型
- `app/composables/useAuth.ts` - 认证状态管理
- `app/pages/admin/settings.vue` - 管理后台设置页面
- `app/pages/index.vue` - 首页
- `README.md` - 项目说明文档

## 🔧 部署说明

### 数据库迁移

如果您已有运行中的应用，需要更新数据库：

```bash
# 推送数据库模型更新
pnpm db:push

# 重新生成 Prisma Client
pnpm prisma:generate
```

### 环境要求

- Node.js >= 18
- MySQL 数据库（支持 LongText 字段类型）
- 确保数据库有足够的存储空间（base64 图片约比原始文件大 33%）

## 📊 性能影响

### 数据库
- 新增 `homeBackground` 字段（LongText 类型）
- 单个背景图片（4MB）约占用 5.3MB 数据库空间
- **数据库限制**：TiDB Cloud 单条记录最大 6MB
- 建议定期清理不使用的背景

### 前端
- 首次加载时获取背景数据（包含在用户信息中）
- base64 图片直接嵌入 HTML，无额外 HTTP 请求
- 大图片可能影响首页加载速度，**强烈建议**用户压缩图片（1-2MB 最佳）

### 前端
- 首次加载时获取背景数据（包含在用户信息中）
- base64 图片直接嵌入 HTML，无额外 HTTP 请求
- 大图片可能影响首页加载速度，建议用户压缩图片

## 🐛 已知问题

暂无

## 🎯 未来计划

- [ ] 支持多张背景图片轮播
- [ ] 添加背景图片模糊度调节
- [ ] 提供默认背景图片库
- [ ] 支持视频背景
- [ ] 背景定时切换功能

## 📚 相关文档

- [首页背景功能详细文档](./HOME_BACKGROUND_FEATURE.md)
- [项目 README](../README.md)

---

**开发者**: LinkLantern Team  
**更新时间**: 2026-01-19

