# 背景配置功能文档

## 功能概述

LinkLantern 现在支持自定义首页背景的显示效果，用户可以：
1. 调整背景遮罩的透明度（0-100%）
2. 调整背景的模糊度（0-20px）
3. 实时预览配置效果
4. 使用快速预设切换不同风格

所有配置都会自动同步到首页显示。

## 技术实现

### 1. 数据库模型更新

在 `User` 模型中新增了两个字段：

```prisma
model User {
  // ... 其他字段
  backgroundOpacity Int  @default(80)  // 背景遮罩透明度 (0-100)
  backgroundBlur    Int  @default(8)   // 背景模糊度 (0-20)
}
```

**默认值说明：**
- `backgroundOpacity`: 80 (80% 透明度，标准风格)
- `backgroundBlur`: 8 (8px 模糊，标准风格)

### 2. API 接口

#### PUT /api/auth/background-config

更新用户的背景配置。

**请求头：**
```
Authorization: Bearer <token>
```

**请求体：**
```json
{
  "opacity": 80,  // 可选，0-100
  "blur": 8       // 可选，0-20
}
```

**响应：**
```json
{
  "success": true,
  "message": "背景配置更新成功",
  "data": {
    "user": {
      "id": 1,
      "backgroundOpacity": 80,
      "backgroundBlur": 8,
      // ... 其他用户信息
    }
  }
}
```

**验证规则：**
- `opacity`: 必须是 0-100 之间的数字
- `blur`: 必须是 0-20 之间的数字
- 至少提供一个配置项

### 3. 前端实现

#### useAuth Composable

新增了 `updateBackgroundConfig` 方法：

```typescript
const { updateBackgroundConfig } = useAuth()

// 更新配置
await updateBackgroundConfig({
  opacity: 80,
  blur: 8
})
```

#### Settings 页面

**实时预览功能：**
- 使用大型预览框显示背景效果
- 包含示例内容展示实际显示效果
- 配置变化实时反映到预览框

**配置控制：**
1. **透明度滑块**
   - 范围：0-100%
   - 步进：5%
   - 显示当前值

2. **模糊度滑块**
   - 范围：0-20px
   - 步进：1px
   - 显示当前值

3. **快速预设**
   - 清晰风格：70% 透明度 + 4px 模糊
   - 标准风格：80% 透明度 + 8px 模糊（推荐）
   - 朦胧风格：90% 透明度 + 12px 模糊
   - 极简风格：95% 透明度 + 16px 模糊

**防抖机制：**
- 配置变化后延迟 500ms 才发送更新请求
- 避免频繁的 API 调用
- 提升用户体验

#### Index 页面

首页根据用户配置动态应用背景效果：

```vue
<div 
  class="absolute inset-0 bg-white dark:bg-gray-900"
  :style="{
    opacity: backgroundOpacity / 100,
    backdropFilter: `blur(${backgroundBlur}px)`,
    WebkitBackdropFilter: `blur(${backgroundBlur}px)`
  }"
></div>
```

## 使用指南

### 1. 配置背景效果

1. 登录账号
2. 进入"系统设置"页面
3. 找到"首页背景设置"部分
4. 调整透明度和模糊度滑块
5. 在实时预览中查看效果
6. 或点击快速预设按钮选择风格
7. 配置自动保存

### 2. 查看效果

访问首页即可看到应用配置后的背景效果。

### 3. 风格选择建议

- **清晰风格** (70% + 4px)
  - 适合高对比度的背景图
  - 背景细节清晰可见
  - 内容仍然易读

- **标准风格** (80% + 8px) ⭐️ 推荐
  - 平衡背景和内容
  - 适合大多数场景
  - 默认配置

- **朦胧风格** (90% + 12px)
  - 背景若隐若现
  - 更突出前景内容
  - 适合繁杂的背景

- **极简风格** (95% + 16px)
  - 背景几乎不可见
  - 最突出前景内容
  - 适合专注体验

## 技术细节

### CSS 实现

使用 CSS 的 `opacity` 和 `backdrop-filter` 属性：

```css
.overlay {
  opacity: 0.8;  /* 80% */
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px); /* Safari 兼容 */
}
```

### 浏览器兼容性

- `opacity`: 所有现代浏览器均支持
- `backdrop-filter`: 
  - Chrome 76+
  - Firefox 103+
  - Safari 9+ (需要 -webkit- 前缀)
  - Edge 79+

### 性能考虑

1. **防抖机制**: 配置更新使用 500ms 防抖，减少 API 调用
2. **CSS 动画**: 使用硬件加速的 CSS 属性
3. **状态管理**: 配置存储在数据库，随用户信息一起加载

## API 返回的用户对象

所有背景相关的 API 端点现在都会返回完整的背景配置：

```json
{
  "id": 1,
  "email": "user@example.com",
  "homeBackground": "data:image/png;base64,...",
  "useBingWallpaper": false,
  "backgroundOpacity": 80,
  "backgroundBlur": 8,
  // ... 其他字段
}
```

## 相关文档

- [背景图片上传功能](./HOME_BACKGROUND_FEATURE.md)
- [必应壁纸功能](./CHANGELOG_2026-01-19.md)
- [API 文档](../server/api/auth/background-config.put.ts)

## 更新日志

### 2026-01-20
- ✅ 新增背景透明度配置
- ✅ 新增背景模糊度配置
- ✅ 新增实时预览功能
- ✅ 新增快速预设功能
- ✅ 实现防抖机制
- ✅ 更新所有相关 API 端点

