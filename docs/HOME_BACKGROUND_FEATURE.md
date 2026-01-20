# 首页自定义背景功能

## 📖 功能概述

LinkLantern 现在支持自定义首页背景图片功能！您可以上传自己喜欢的图片作为首页背景，让您的导航页面更具个性化。背景图片以 base64 格式存储在数据库中，无需额外的文件存储服务。

## ✨ 功能特点

- 🖼️ **完全自定义**：支持上传任何图片作为首页背景
- 💾 **数据库存储**：base64 格式存储，无需额外文件服务
- 🎨 **实时预览**：上传后立即看到效果
- 📱 **响应式设计**：自动适配不同屏幕尺寸
- 🌓 **深色模式适配**：在明暗主题下都有良好显示效果
- 🔒 **用户隔离**：每个用户有独立的背景设置

## 🚀 使用指南

### 1. 上传背景图片

#### 步骤：
1. 登录您的账户
2. 进入「管理后台」→「关于」页面
3. 找到「首页背景设置」区域
4. 点击「上传背景」按钮
5. 选择您喜欢的图片文件
6. 等待上传完成，预览效果

#### 支持的格式：
- JPG / JPEG
- PNG
- GIF
- WebP

#### 限制：
- 文件大小：最大 4MB（数据库存储限制）
- 建议分辨率：1920x1080 或更高
- 建议使用横向图片
- **重要**：由于 base64 编码会增加约 33% 的大小，而数据库最大条目限制为 6MB，因此原始文件限制为 4MB

### 2. 查看效果

上传成功后：
1. 返回首页（点击导航栏的「LinkLantern」或访问 `/`）
2. 您将看到自定义的背景图片
3. 背景会自动添加半透明遮罩，确保内容清晰可读

### 3. 更换背景

如果想更换背景：
1. 进入「管理后台」→「关于」页面
2. 在「首页背景设置」区域查看当前背景预览
3. 点击「更换背景」按钮
4. 选择新的图片文件
5. 新背景将立即替换旧背景

### 4. 删除背景

如果想恢复默认背景：
1. 进入「管理后台」→「关于」页面
2. 在「首页背景设置」区域
3. 点击「删除背景」按钮
4. 确认删除后，首页将恢复默认渐变背景

## 🛠️ 技术实现

### 数据库模型

在 User 表中新增了 `homeBackground` 字段：

```prisma
model User {
  id              Int       @id @default(autoincrement())
  email           String    @unique
  password        String
  name            String?
  avatar          String?
  homeBackground  String?   @db.LongText  // 首页背景（base64）
  // ... 其他字段
}
```

### API 接口

#### 1. 上传背景图片

```http
PUT /api/auth/background
Authorization: Bearer {token}
Content-Type: application/json

{
  "background": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**响应：**
```json
{
  "success": true,
  "message": "背景图片上传成功",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "用户名",
      "homeBackground": "data:image/jpeg;base64,..."
    }
  }
}
```

#### 2. 获取背景图片

```http
GET /api/auth/background
Authorization: Bearer {token}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "background": "data:image/jpeg;base64,..."
  }
}
```

#### 3. 删除背景图片

```http
DELETE /api/auth/background
Authorization: Bearer {token}
```

**响应：**
```json
{
  "success": true,
  "message": "背景图片已删除",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "用户名",
      "homeBackground": null
    }
  }
}
```

### 前端实现

#### Composable 方法

在 `useAuth` composable 中新增了三个方法：

```typescript
// 更新首页背景
const updateHomeBackground = async (background: string) => {
  // ... 实现代码
}

// 删除首页背景
const deleteHomeBackground = async () => {
  // ... 实现代码
}

// 获取首页背景
const getHomeBackground = async () => {
  // ... 实现代码
}
```

#### 首页显示

在 `pages/index.vue` 中：

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
      :style="{ 
        backgroundImage: `url(${homeBackground})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center' 
      }"
    >
      <!-- 半透明遮罩，确保内容可读 -->
      <div class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"></div>
    </div>
    
    <!-- 页面内容 -->
    <main class="relative z-10">
      <!-- ... -->
    </main>
  </div>
</template>

<script setup>
const { user } = useAuth()
const homeBackground = computed(() => user.value?.homeBackground || null)
</script>
```

## 📝 使用提示

### 最佳实践

1. **图片选择**
   - 选择清晰、美观的图片
   - 避免过于复杂或对比度过高的图片
   - 横向图片效果更好

2. **文件大小**
   - **务必**压缩图片以减小文件大小
   - **强烈推荐**使用在线图片压缩工具（如 TinyPNG、Squoosh）
   - 4MB 以内的图片加载速度更快
   - 由于数据库限制，文件不能超过 4MB

3. **色彩搭配**
   - 选择与应用主题色搭配的图片
   - 半透明遮罩会让图片变淡，考虑这一点
   - 测试在明暗两种主题下的显示效果

### 注意事项

1. **存储空间**
   - base64 格式会比原始文件略大（约 33%）
   - **数据库限制**：单条记录最大 6MB（TiDB Cloud 限制）
   - 因此原始文件限制为 4MB，编码后约 5.3MB
   - 建议定期清理不需要的背景图片

2. **性能影响**
   - 大图片会影响首页加载速度
   - **强烈建议**控制图片大小在 1-2MB 以内
   - 用户信息会在登录时加载，包含背景数据
   - 使用图片压缩工具可以在保持画质的同时大幅减小文件大小

3. **浏览器兼容性**
   - base64 图片在所有现代浏览器中都支持良好
   - 移动端也能正常显示
   - backdrop-blur 效果在部分旧浏览器可能不生效

## 🔧 故障排除

### 上传失败

**问题**：点击上传后提示失败

**解决方案**：
1. **检查图片文件是否超过 4MB**（这是最常见的原因）
2. 确认文件格式是否支持（JPG/PNG/GIF/WebP）
3. 使用图片压缩工具减小文件大小（推荐 TinyPNG、Squoosh）
4. 检查网络连接是否正常
5. 查看浏览器控制台错误信息

### 背景不显示

**问题**：上传成功但首页看不到背景

**解决方案**：
1. 刷新首页（Ctrl+R 或 F5）
2. 清除浏览器缓存
3. 退出登录后重新登录
4. 检查浏览器控制台是否有错误

### 图片显示异常

**问题**：背景图片显示不完整或变形

**解决方案**：
1. 使用横向图片（16:9 比例最佳）
2. 提高图片分辨率
3. 检查图片本身是否完整

## 📊 数据迁移

如果您需要迁移到新环境：

1. **导出时**：用户背景数据会随用户信息一起保存
2. **导入时**：运行 `pnpm db:push` 更新数据库结构
3. **手动迁移**：可以直接复制数据库中的 `homeBackground` 字段

## 🎯 未来计划

- [ ] 支持多张背景图片轮播
- [ ] 添加背景图片模糊度调节
- [ ] 提供默认背景图片库
- [ ] 支持视频背景
- [ ] 背景定时切换功能

## 📞 反馈与支持

如果您在使用过程中遇到问题或有建议，欢迎：
- 提交 Issue
- 发起 Pull Request
- 联系开发者

---

**祝您使用愉快！✨**

