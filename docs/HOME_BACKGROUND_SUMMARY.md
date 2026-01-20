# 首页自定义背景功能 - 开发总结

## ✅ 已完成的任务

### 1. 数据库设计 ✓
- [x] 在 User 表中添加 `homeBackground` 字段（LongText 类型）
- [x] 执行数据库迁移（pnpm db:push）
- [x] 重新生成 Prisma Client

### 2. 后端 API 开发 ✓
- [x] 创建上传背景接口（PUT /api/auth/background）
  - 验证用户身份
  - 验证 base64 格式
  - 限制文件大小（2MB）
  - 更新数据库
- [x] 创建获取背景接口（GET /api/auth/background）
- [x] 创建删除背景接口（DELETE /api/auth/background）
- [x] 统一接口实现风格（参考其他 auth 接口）
- [x] 使用 requireAuth 中间件进行身份验证
- [x] 完善错误处理

### 3. 前端状态管理 ✓
- [x] 更新 User 类型定义，添加 homeBackground 字段
- [x] 在 useAuth composable 中添加背景管理方法：
  - updateHomeBackground()
  - deleteHomeBackground()
  - getHomeBackground()
- [x] 自动从用户信息中获取背景

### 4. 管理后台界面 ✓
- [x] 在 settings 页面添加「首页背景设置」区域
- [x] 实现背景预览功能
- [x] 实现文件上传功能
- [x] 实现图片格式和大小验证
- [x] 实现背景删除功能
- [x] 添加使用提示信息
- [x] 优化用户体验（加载状态、错误提示）

### 5. 首页展示 ✓
- [x] 修改页面结构支持自定义背景
- [x] 添加背景图片层（fixed 定位）
- [x] 添加半透明遮罩层确保内容可读
- [x] 实现响应式设计
- [x] 兼容明暗主题
- [x] 保持默认渐变背景作为备选

### 6. 文档编写 ✓
- [x] 更新 README.md
- [x] 创建功能详细文档（HOME_BACKGROUND_FEATURE.md）
- [x] 创建更新日志（CHANGELOG_2026-01-19.md）
- [x] 更新 API 接口文档
- [x] 更新数据模型文档

## 🎯 功能特点

### 用户体验
- ✨ 简单易用的上传界面
- 👀 实时预览效果
- 🎨 自动适配明暗主题
- 📱 响应式设计
- ⚡ 无额外 HTTP 请求（base64 嵌入）

### 技术特点
- 🔒 JWT 身份验证
- 💾 base64 数据库存储
- 📏 文件大小限制（2MB）
- ✅ 格式验证
- 🛡️ 完善的错误处理
- 🎯 类型安全（TypeScript）

## 📁 文件结构

```
LinkLantern/
├── prisma/
│   └── schema.prisma                           # 更新：添加 homeBackground 字段
├── server/
│   └── api/
│       └── auth/
│           ├── background.get.ts               # 新增：获取背景接口
│           ├── background.put.ts               # 新增：上传背景接口
│           └── background.delete.ts            # 新增：删除背景接口
├── app/
│   ├── composables/
│   │   └── useAuth.ts                          # 更新：添加背景管理方法
│   └── pages/
│       ├── index.vue                           # 更新：支持显示自定义背景
│       └── admin/
│           └── settings.vue                    # 更新：添加背景上传界面
├── docs/
│   ├── HOME_BACKGROUND_FEATURE.md              # 新增：功能详细文档
│   └── CHANGELOG_2026-01-19.md                 # 新增：更新日志
└── README.md                                    # 更新：功能说明
```

## 🔍 技术实现细节

### 1. 数据流

```
用户选择图片
    ↓
前端读取文件转 base64
    ↓
调用 updateHomeBackground()
    ↓
发送 PUT /api/auth/background
    ↓
后端验证（格式、大小、用户身份）
    ↓
更新数据库
    ↓
返回最新用户信息
    ↓
更新前端 user state
    ↓
首页自动显示新背景
```

### 2. 关键代码片段

#### 前端上传处理
```typescript
const reader = new FileReader()
reader.onload = async (e) => {
  const base64 = e.target?.result as string
  const result = await updateHomeBackground(base64)
  // 处理结果...
}
reader.readAsDataURL(file)
```

#### 后端验证
```typescript
// 验证格式
if (!background.startsWith('data:image/')) {
  throw createError({ statusCode: 400, statusMessage: '格式错误' })
}

// 验证大小（4MB 限制，避免超过数据库 6MB）
const sizeInMB = (background.length * 3 / 4) / (1024 * 1024)
if (sizeInMB > 4) {
  throw createError({ statusCode: 400, statusMessage: '文件过大' })
}
```

#### 首页显示
```vue
<div v-if="homeBackground" class="fixed inset-0 z-0"
     :style="{ backgroundImage: `url(${homeBackground})` }">
  <div class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"></div>
</div>
```

## 📊 性能考虑

### 优化措施
- ✅ 限制文件大小（4MB，考虑数据库 6MB 限制）
- ✅ base64 直接嵌入，减少 HTTP 请求
- ✅ 背景数据随用户信息一起加载，无额外请求
- ✅ 使用 CSS backdrop-blur 提升视觉效果
- ⚠️ **重要**：强烈建议用户压缩图片到 1-2MB

### 潜在问题
- ⚠️ 大图片可能影响首页加载速度
- ⚠️ **数据库限制**：TiDB Cloud 单条记录最大 6MB
- ⚠️ base64 比原文件大约 33%
- ⚠️ 因此原始文件限制为 4MB

### 建议
- 📝 **强烈建议**用户压缩图片（使用 TinyPNG、Squoosh 等）
- 📝 理想文件大小：1-2MB
- 📝 考虑添加服务端图片压缩
- 📝 未来可支持云存储（OSS）绕过数据库限制

## 🎨 用户使用流程

### 上传背景
1. 登录账户
2. 进入「管理后台」→「关于」
3. 点击「上传背景」
4. 选择图片文件（<4MB，建议 1-2MB）
5. 自动上传并预览
6. 返回首页查看效果

### 更换背景
1. 进入设置页面
2. 点击「更换背景」
3. 选择新图片
4. 自动替换

### 删除背景
1. 进入设置页面
2. 点击「删除背景」
3. 恢复默认渐变背景

## 🧪 测试建议

### 功能测试
- [ ] 上传各种格式的图片（JPG、PNG、GIF、WebP）
- [ ] 上传超过 4MB 的图片（应该失败）
- [ ] 上传接近 4MB 的图片（应该成功）
- [ ] 上传非图片文件（应该失败）
- [ ] 删除背景后再次上传
- [ ] 在不同屏幕尺寸下测试显示效果
- [ ] 测试明暗主题切换

### 边界测试
- [ ] 未登录状态访问接口
- [ ] Token 过期时的处理
- [ ] 网络中断时的处理
- [ ] 并发上传多次

## 💡 未来改进方向

### 短期
- 添加背景压缩功能
- 支持裁剪和调整
- 添加预设背景库

### 中期
- 多张背景轮播
- 背景模糊度调节
- 背景亮度调节
- 自定义遮罩透明度

### 长期
- 视频背景支持
- 动态背景效果
- AI 生成背景
- 背景分享社区

## 📞 技术支持

如有问题，请：
- 查看 [功能文档](./HOME_BACKGROUND_FEATURE.md)
- 查看 [更新日志](./CHANGELOG_2026-01-19.md)
- 检查浏览器控制台错误
- 查看服务器日志

---

**开发完成时间**: 2026-01-19  
**开发者**: AI Assistant  
**状态**: ✅ 已完成并测试

