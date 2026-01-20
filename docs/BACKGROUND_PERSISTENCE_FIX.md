# 背景配置持久化问题修复

## 问题描述

### 问题 1: 首页刷新后背景消失
用户设置了自定义背景或必应壁纸后，刷新页面背景图片就消失了，需要重新登录才能看到。

### 问题 2: 进入 settings 页面无法获取背景配置
进入 `admin/settings` 页面时，无法从后端获取当前的背景配置信息（透明度、模糊度等）。

## 问题原因

所有认证相关的 API 接口在返回用户信息时，**没有包含背景配置字段**：
- `homeBackground` - 自定义背景图片
- `useBingWallpaper` - 必应壁纸开关
- `backgroundOpacity` - 背景透明度
- `backgroundBlur` - 背景模糊度

这导致：
1. 登录后，localStorage 中存储的用户信息不包含背景配置
2. 刷新页面时，从 localStorage 恢复的用户信息缺少背景配置
3. 调用 `/api/auth/me` 获取用户信息时，也没有返回背景配置

## 解决方案

更新所有用户相关的 API 接口，确保返回完整的背景配置字段。

## 修改文件

### 1. `/server/api/auth/me.get.ts`
**功能**: 获取当前登录用户信息

**修改前**:
```typescript
select: {
  id: true,
  email: true,
  name: true,
  avatar: true,
  isActive: true,
  emailVerified: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
}
```

**修改后**:
```typescript
select: {
  id: true,
  email: true,
  name: true,
  avatar: true,
  homeBackground: true,           // ✅ 新增
  useBingWallpaper: true,         // ✅ 新增
  backgroundOpacity: true,        // ✅ 新增
  backgroundBlur: true,           // ✅ 新增
  isActive: true,
  emailVerified: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
}
```

### 2. `/server/api/auth/me.put.ts`
**功能**: 更新当前用户信息

**修改**: 与 `me.get.ts` 相同，在 `select` 中添加背景配置字段。

### 3. `/server/api/auth/login.post.ts`
**功能**: 用户登录

**修改前**:
```typescript
user: {
  id: userWithoutPassword.id,
  email: userWithoutPassword.email,
  name: userWithoutPassword.name,
  avatar: userWithoutPassword.avatar,
  isActive: userWithoutPassword.isActive,
  emailVerified: userWithoutPassword.emailVerified,
  lastLoginAt: new Date(),
  createdAt: userWithoutPassword.createdAt,
}
```

**修改后**:
```typescript
user: {
  id: userWithoutPassword.id,
  email: userWithoutPassword.email,
  name: userWithoutPassword.name,
  avatar: userWithoutPassword.avatar,
  homeBackground: userWithoutPassword.homeBackground,           // ✅ 新增
  useBingWallpaper: userWithoutPassword.useBingWallpaper,       // ✅ 新增
  backgroundOpacity: userWithoutPassword.backgroundOpacity,     // ✅ 新增
  backgroundBlur: userWithoutPassword.backgroundBlur,           // ✅ 新增
  isActive: userWithoutPassword.isActive,
  emailVerified: userWithoutPassword.emailVerified,
  lastLoginAt: new Date(),
  createdAt: userWithoutPassword.createdAt,
}
```

### 4. `/server/api/auth/register.post.ts`
**功能**: 用户注册

**修改**: 在创建用户后的 `select` 中添加背景配置字段（返回默认值）。

## 数据流程

### 修复前 ❌

```
登录 → API 返回用户信息（无背景配置） → localStorage 存储（无背景配置）
       ↓
刷新页面 → 从 localStorage 恢复（无背景配置） → 背景消失 ❌
       ↓
调用 /api/auth/me → 返回用户信息（无背景配置） → 背景仍然不显示 ❌
```

### 修复后 ✅

```
登录 → API 返回用户信息（包含背景配置） → localStorage 存储（包含背景配置）
       ↓
刷新页面 → 从 localStorage 恢复（包含背景配置） → 背景正常显示 ✅
       ↓
调用 /api/auth/me → 返回用户信息（包含背景配置） → 保持最新状态 ✅
```

## 生命周期说明

### 1. 首次登录/注册
```typescript
// 1. 用户登录/注册
POST /api/auth/login or /api/auth/register

// 2. 服务器返回完整用户信息（包含背景配置）
{
  user: {
    id: 1,
    email: "user@example.com",
    homeBackground: "data:image/png;base64,...",  // ✅
    useBingWallpaper: false,                      // ✅
    backgroundOpacity: 80,                        // ✅
    backgroundBlur: 8                             // ✅
  },
  tokens: { ... }
}

// 3. 前端保存到 localStorage
localStorage.setItem('user', JSON.stringify(user))
```

### 2. 页面刷新
```typescript
// 1. useAuth 初始化，从 localStorage 恢复
const user = useState('auth:user', () => {
  if (process.client) {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null  // ✅ 包含背景配置
  }
  return null
})

// 2. 首页使用背景配置
const homeBackground = computed(() => user.value?.homeBackground)
const useBingWallpaper = computed(() => user.value?.useBingWallpaper)
```

### 3. 更新背景配置
```typescript
// 1. 用户上传背景或调整配置
PUT /api/auth/background
PUT /api/auth/background-config
PUT /api/auth/bing-wallpaper

// 2. API 返回更新后的用户信息
{
  success: true,
  data: {
    user: { /* 包含最新的背景配置 */ }
  }
}

// 3. 前端更新 state 和 localStorage
user.value = response.data.user
localStorage.setItem('user', JSON.stringify(response.data.user))
```

## 测试验证

### 测试场景 1: 首次登录
1. ✅ 登录账号
2. ✅ 上传自定义背景
3. ✅ 背景正常显示
4. ✅ 刷新页面
5. ✅ 背景仍然显示（修复成功）

### 测试场景 2: 必应壁纸
1. ✅ 登录账号
2. ✅ 启用必应壁纸
3. ✅ 壁纸正常显示
4. ✅ 刷新页面
5. ✅ 壁纸仍然显示（修复成功）

### 测试场景 3: 配置调整
1. ✅ 登录账号
2. ✅ 调整透明度和模糊度
3. ✅ 配置立即生效
4. ✅ 刷新页面
5. ✅ 配置保持不变（修复成功）

### 测试场景 4: 进入 Settings
1. ✅ 登录账号
2. ✅ 设置背景配置
3. ✅ 进入 admin/settings 页面
4. ✅ 正确显示当前配置（修复成功）

## 相关接口完整性检查

已确保以下接口都返回背景配置字段：

| 接口 | 文件 | 状态 |
|------|------|------|
| GET /api/auth/me | `server/api/auth/me.get.ts` | ✅ 已修复 |
| PUT /api/auth/me | `server/api/auth/me.put.ts` | ✅ 已修复 |
| POST /api/auth/login | `server/api/auth/login.post.ts` | ✅ 已修复 |
| POST /api/auth/register | `server/api/auth/register.post.ts` | ✅ 已修复 |
| PUT /api/auth/background | `server/api/auth/background.put.ts` | ✅ 已支持 |
| GET /api/auth/background | `server/api/auth/background.get.ts` | ✅ 已支持 |
| DELETE /api/auth/background | `server/api/auth/background.delete.ts` | ✅ 已支持 |
| PUT /api/auth/bing-wallpaper | `server/api/auth/bing-wallpaper.put.ts` | ✅ 已支持 |
| PUT /api/auth/background-config | `server/api/auth/background-config.put.ts` | ✅ 已支持 |

## 前端 localStorage 结构

修复后，localStorage 中存储的用户信息结构：

```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "张三",
  "avatar": "https://...",
  "homeBackground": "data:image/png;base64,iVBORw0KG...",
  "useBingWallpaper": false,
  "backgroundOpacity": 80,
  "backgroundBlur": 8,
  "isActive": true,
  "emailVerified": true,
  "lastLoginAt": "2026-01-20T10:30:00.000Z",
  "createdAt": "2026-01-15T08:20:00.000Z"
}
```

## 注意事项

### 1. 数据大小
- `homeBackground` 字段可能包含大量 base64 数据（最大 4MB）
- localStorage 在某些浏览器中有 5-10MB 的限制
- 建议提醒用户不要上传过大的图片

### 2. 安全性
- 背景图片数据存储在 localStorage 中
- localStorage 可以被同域的 JavaScript 访问
- 不建议存储敏感图片

### 3. 性能
- 首次加载时会从 localStorage 读取大量数据
- 如果背景图片很大，可能影响初始化速度
- 可以考虑添加加载动画

## 后续优化建议

### 1. 分离背景数据
将背景图片数据从用户信息中分离：
```typescript
// 用户基本信息
localStorage.setItem('user', JSON.stringify(basicUserInfo))

// 背景配置单独存储
localStorage.setItem('userBackground', JSON.stringify({
  homeBackground,
  useBingWallpaper,
  backgroundOpacity,
  backgroundBlur
}))
```

### 2. 懒加载背景
```typescript
// 先显示默认背景，异步加载自定义背景
onMounted(async () => {
  if (user.value?.id) {
    const bg = await fetchUserBackground()
    applyBackground(bg)
  }
})
```

### 3. 缓存策略
使用 IndexedDB 存储大型背景图片，localStorage 只存储配置。

## 更新日志

### 2026-01-20
- ✅ 修复首页刷新后背景消失问题
- ✅ 修复 settings 页面无法获取背景配置问题
- ✅ 更新所有认证 API 接口返回背景配置字段
- ✅ 确保 localStorage 持久化背景配置
- ✅ 测试验证所有场景

## 相关文档

- [背景配置功能](./BACKGROUND_CONFIG_FEATURE.md)
- [背景设置组件](./BACKGROUND_SETTINGS_COMPONENT.md)
- [背景可读性优化](./BACKGROUND_READABILITY_FIX.md)

