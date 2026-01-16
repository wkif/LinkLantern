# 数据导入导出功能指南

## 📋 功能概述

LinkLantern 提供了完整的数据导入导出功能，让您可以轻松备份、迁移和恢复链接数据。

### ✨ 主要特性

- 📤 **数据导出**：将所有链接导出为 JSON 文件
- 📥 **数据导入**：从 JSON 文件导入链接数据
- 🔄 **双模式导入**：支持追加和替换两种模式
- 🛡️ **安全保护**：替换模式有明确警告提示
- 📊 **详细反馈**：显示导入结果统计（成功/跳过/失败）

---

## 🚀 使用指南

### 1. 访问数据管理页面

登录后，访问管理后台的「关于」页面：

```
/admin/settings
```

在页面顶部可以看到「数据管理」卡片。

---

## 📤 导出数据

### 操作步骤

1. 点击「导出链接数据」按钮
2. 系统会自动生成 JSON 文件并下载
3. 文件名格式：`linklantern-export-YYYY-MM-DD.json`

### 导出数据格式

```json
{
  "version": "1.0",
  "exportDate": "2026-01-16T12:00:00.000Z",
  "totalLinks": 10,
  "links": [
    {
      "url": "https://example.com",
      "title": "示例网站",
      "description": "这是一个示例网站的描述",
      "icon": "https://example.com/favicon.ico",
      "category": "工具",
      "isPublic": false,
      "clicks": 5,
      "createdAt": "2026-01-15T10:00:00.000Z",
      "updatedAt": "2026-01-16T10:00:00.000Z"
    }
  ]
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `version` | string | ✅ | 数据格式版本号 |
| `exportDate` | string | ✅ | 导出时间（ISO 8601 格式） |
| `totalLinks` | number | ✅ | 链接总数 |
| `links` | array | ✅ | 链接数组 |

### 链接对象字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `url` | string | ✅ | 链接地址 |
| `title` | string | ✅ | 链接标题 |
| `description` | string | ❌ | 链接描述 |
| `icon` | string | ❌ | 图标/Favicon URL |
| `category` | string | ❌ | 分类标签 |
| `isPublic` | boolean | ❌ | 是否公开（默认 false） |
| `clicks` | number | - | 点击次数（导入时会重置为 0） |
| `createdAt` | string | - | 创建时间（仅供参考） |
| `updatedAt` | string | - | 更新时间（仅供参考） |

---

## 📥 导入数据

### 导入模式

#### 1. 追加模式（Append）

**特点**：
- ✅ 保留所有现有链接
- ✅ 仅添加新链接
- ✅ 自动跳过重复的链接（根据 URL 判断）
- ✅ 安全可靠，不会丢失数据

**适用场景**：
- 从其他设备导入部分链接
- 合并多个备份文件
- 补充新的链接数据

**示例结果**：
```
导入完成：成功 8 个，跳过 2 个，失败 0 个
```

---

#### 2. 替换模式（Replace）

**特点**：
- ⚠️ **删除所有现有链接**
- ⚠️ 用导入的数据完全替换
- ⚠️ 不可逆操作
- ✅ 适合完整恢复备份

**适用场景**：
- 恢复完整备份
- 重置所有数据
- 迁移到新账户

**示例结果**：
```
导入完成：成功 10 个，跳过 0 个，失败 0 个，删除 5 个
```

---

### 操作步骤

1. **选择导入模式**
   - 默认为「追加模式」
   - 如需完全替换，选择「替换模式」（会显示警告）

2. **选择文件**
   - 点击「选择文件导入」按钮
   - 选择之前导出的 JSON 文件
   - 仅支持 `.json` 格式

3. **等待导入完成**
   - 系统会显示导入进度
   - 完成后显示详细统计信息

---

## 🔧 API 端点

### 导出 API

**端点**：`GET /api/links/export`

**认证**：需要 JWT Token

**请求头**：
```http
Authorization: Bearer <access_token>
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "version": "1.0",
    "exportDate": "2026-01-16T12:00:00.000Z",
    "totalLinks": 10,
    "links": [...]
  }
}
```

---

### 导入 API

**端点**：`POST /api/links/import`

**认证**：需要 JWT Token

**请求头**：
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**请求体**：
```json
{
  "links": [
    {
      "url": "https://example.com",
      "title": "示例网站",
      "description": "可选描述",
      "icon": "https://example.com/favicon.ico",
      "category": "工具",
      "isPublic": false
    }
  ],
  "mode": "append"  // 或 "replace"
}
```

**响应示例（追加模式）**：
```json
{
  "success": true,
  "data": {
    "imported": 8,
    "skipped": 2,
    "failed": 0
  },
  "message": "导入完成：成功 8 个，跳过 2 个，失败 0 个"
}
```

**响应示例（替换模式）**：
```json
{
  "success": true,
  "data": {
    "imported": 10,
    "skipped": 0,
    "failed": 0,
    "deleted": 5
  },
  "message": "导入完成：成功 10 个，跳过 0 个，失败 0 个，删除 5 个"
}
```

---

## 💡 使用场景

### 1. 定期备份

**建议频率**：每周或每月

**操作**：
1. 访问数据管理页面
2. 点击「导出链接数据」
3. 将文件保存到云盘或外部存储

---

### 2. 设备间迁移

**场景**：从电脑 A 迁移到电脑 B

**步骤**：
1. 在电脑 A 上导出数据
2. 将 JSON 文件传输到电脑 B
3. 在电脑 B 上使用「追加模式」导入

---

### 3. 完整恢复

**场景**：误删除数据或账户重置

**步骤**：
1. 准备之前的备份文件
2. 选择「替换模式」
3. 导入备份文件

⚠️ **注意**：替换模式会删除所有现有数据！

---

### 4. 数据合并

**场景**：合并多个来源的链接

**步骤**：
1. 依次导入多个 JSON 文件
2. 都使用「追加模式」
3. 系统自动跳过重复链接

---

## ⚠️ 注意事项

### 1. 数据安全

- ✅ 导出的 JSON 文件包含所有链接信息
- ⚠️ 请妥善保管备份文件，避免泄露
- ⚠️ 不要将包含敏感信息的文件分享给他人

### 2. 文件格式

- ✅ 必须是有效的 JSON 格式
- ✅ 必须包含 `links` 数组
- ✅ 每个链接必须有 `url` 和 `title` 字段

### 3. 导入限制

- ⚠️ 缺少必填字段的链接会被跳过
- ⚠️ 无效的数据会导致导入失败
- ⚠️ 替换模式不可撤销

### 4. 性能考虑

- 📊 导入大量数据时可能需要较长时间
- 📊 建议单次导入不超过 1000 条链接
- 📊 大量数据建议分批导入

---

## 🔍 常见问题

### Q1: 导出的文件在哪里？

**A**：文件会自动下载到浏览器的默认下载目录，文件名格式为 `linklantern-export-YYYY-MM-DD.json`。

---

### Q2: 可以编辑导出的 JSON 文件吗？

**A**：可以！您可以使用任何文本编辑器打开和编辑 JSON 文件。但请确保保持正确的格式，否则导入时会失败。

---

### Q3: 导入时为什么有些链接被跳过？

**A**：在追加模式下，如果链接的 URL 已存在，系统会自动跳过以避免重复。

---

### Q4: 替换模式可以撤销吗？

**A**：不可以。替换模式会永久删除所有现有链接。建议在使用替换模式前先导出备份。

---

### Q5: 导入失败怎么办？

**A**：检查以下几点：
1. 文件格式是否为有效的 JSON
2. 是否包含 `links` 数组
3. 每个链接是否包含必填字段（`url` 和 `title`）
4. 文件是否损坏

---

### Q6: 可以导入其他工具的书签吗？

**A**：目前仅支持 LinkLantern 导出的格式。如需导入其他工具的数据，需要先转换为 LinkLantern 的 JSON 格式。

---

## 📝 数据格式转换示例

### 从浏览器书签转换

假设您有浏览器导出的书签 HTML，可以编写脚本转换为 LinkLantern 格式：

```javascript
// 示例：将简单的书签列表转换为 LinkLantern 格式
const bookmarks = [
  { url: 'https://example.com', title: '示例网站' },
  { url: 'https://github.com', title: 'GitHub' },
]

const linklanternData = {
  version: '1.0',
  exportDate: new Date().toISOString(),
  totalLinks: bookmarks.length,
  links: bookmarks.map(b => ({
    url: b.url,
    title: b.title,
    description: null,
    icon: null,
    category: null,
    isPublic: false,
  }))
}

// 保存为 JSON 文件
console.log(JSON.stringify(linklanternData, null, 2))
```

---

## 🎯 最佳实践

### 1. 定期备份

- ✅ 每周导出一次数据
- ✅ 保存多个版本的备份
- ✅ 存储在云盘（如 Google Drive、iCloud）

### 2. 文件命名

建议的命名格式：
```
linklantern-backup-2026-01-16.json
linklantern-before-cleanup-2026-01-15.json
```

### 3. 测试恢复

- ✅ 定期测试备份文件是否可用
- ✅ 在测试账户上先尝试导入
- ✅ 确认数据完整性

### 4. 数据清理

导出前建议：
- 删除无效或过期的链接
- 整理分类标签
- 检查链接是否可访问

---

## 🔗 相关文档

- [链接管理 API 文档](./LINK_GUIDE.md)
- [管理后台使用指南](./ADMIN_GUIDE.md)
- [功能总览](./FEATURES_SUMMARY.md)

---

## 📊 技术实现

### 前端实现

**文件位置**：`app/pages/admin/settings.vue`

**核心功能**：
- 使用 `Blob` API 生成下载文件
- 使用 `FileReader` API 读取上传文件
- 实时反馈导入进度和结果

### 后端实现

**API 端点**：
- `server/api/links/export.get.ts` - 导出功能
- `server/api/links/import.post.ts` - 导入功能

**核心逻辑**：
- 使用 Prisma 批量操作
- 事务处理保证数据一致性
- URL 去重检测

---

**最后更新**：2026-01-16  
**版本**：1.0.0

