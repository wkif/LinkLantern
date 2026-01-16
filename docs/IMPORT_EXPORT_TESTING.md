# 数据导入导出功能测试指南

## 📋 测试清单

### 前置准备

1. ✅ 启动开发服务器
```bash
export DATABASE_URL="你的数据库连接字符串"
pnpm dev
```

2. ✅ 登录到管理后台
- 访问 `http://localhost:3000/login`
- 使用测试账号登录

3. ✅ 访问关于页面
- 访问 `http://localhost:3000/admin/settings`
- 确认能看到「数据管理」卡片

---

## 🧪 测试用例

### 测试 1：导出功能

**目标**：验证数据导出功能是否正常工作

**步骤**：
1. 在管理后台的「链接管理」页面添加几个测试链接
2. 访问 `/admin/settings` 页面
3. 点击「导出链接数据」按钮
4. 等待文件下载

**预期结果**：
- ✅ 成功下载 JSON 文件
- ✅ 文件名格式：`linklantern-export-YYYY-MM-DD.json`
- ✅ 显示成功提示：「已导出 X 个链接」
- ✅ JSON 文件包含正确的数据结构

**验证 JSON 格式**：
```json
{
  "version": "1.0",
  "exportDate": "2026-01-16T...",
  "totalLinks": 3,
  "links": [
    {
      "url": "https://...",
      "title": "...",
      "description": "...",
      "icon": "...",
      "category": "...",
      "isPublic": false,
      "clicks": 0,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

---

### 测试 2：导入功能（追加模式）

**目标**：验证追加模式导入功能

**步骤**：
1. 记录当前链接总数（例如：5 个）
2. 准备一个包含 3 个新链接的 JSON 文件
3. 在「数据管理」卡片中选择「追加模式」
4. 点击「选择文件导入」
5. 选择 JSON 文件

**预期结果**：
- ✅ 显示导入进度
- ✅ 显示成功提示：「导入完成：成功 3 个，跳过 0 个，失败 0 个」
- ✅ 链接总数变为 8 个（5 + 3）
- ✅ 原有链接保持不变

---

### 测试 3：导入功能（追加模式 - 有重复）

**目标**：验证去重功能

**步骤**：
1. 导出当前数据
2. 再次导入相同的文件（追加模式）

**预期结果**：
- ✅ 显示：「导入完成：成功 0 个，跳过 X 个，失败 0 个」
- ✅ 链接总数不变
- ✅ 所有重复链接被跳过

---

### 测试 4：导入功能（替换模式）

**目标**：验证替换模式功能

**步骤**：
1. 记录当前链接总数（例如：8 个）
2. 准备一个包含 5 个链接的 JSON 文件
3. 选择「替换模式」
4. 确认看到红色警告提示
5. 点击「选择文件导入」
6. 选择 JSON 文件

**预期结果**：
- ✅ 显示替换模式警告
- ✅ 显示：「导入完成：成功 5 个，跳过 0 个，失败 0 个，删除 8 个」
- ✅ 链接总数变为 5 个
- ✅ 原有链接全部被删除
- ✅ 新链接全部被导入

---

### 测试 5：错误处理

**目标**：验证各种错误场景的处理

#### 5.1 无效的文件类型
**步骤**：
1. 尝试上传一个 `.txt` 文件

**预期结果**：
- ✅ 显示错误提示：「请选择 JSON 文件」

#### 5.2 无效的 JSON 格式
**步骤**：
1. 创建一个格式错误的 JSON 文件
2. 尝试导入

**预期结果**：
- ✅ 显示错误提示：「导入失败」

#### 5.3 缺少必填字段
**步骤**：
1. 创建一个缺少 `title` 字段的 JSON 文件
2. 尝试导入

**预期结果**：
- ✅ 显示：「导入完成：成功 X 个，跳过 0 个，失败 Y 个」
- ✅ 缺少必填字段的链接被标记为失败

---

### 测试 6：UI 交互

**目标**：验证用户界面交互

**检查项**：
- ✅ 导出按钮在导出时显示「导出中...」并禁用
- ✅ 导入按钮在导入时显示「导入中...」并禁用
- ✅ 替换模式时显示红色警告框
- ✅ 追加模式时不显示警告框
- ✅ 单选按钮可以正常切换
- ✅ 文件选择器只接受 `.json` 文件
- ✅ Toast 通知显示正确的图标和颜色

---

### 测试 7：API 端点测试（可选）

**使用 curl 测试**：

#### 7.1 测试导出 API
```bash
curl -X GET http://localhost:3000/api/links/export \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**预期响应**：
```json
{
  "success": true,
  "data": {
    "version": "1.0",
    "exportDate": "...",
    "totalLinks": 5,
    "links": [...]
  }
}
```

#### 7.2 测试导入 API（追加模式）
```bash
curl -X POST http://localhost:3000/api/links/import \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "append",
    "links": [
      {
        "url": "https://example.com",
        "title": "测试链接"
      }
    ]
  }'
```

**预期响应**：
```json
{
  "success": true,
  "data": {
    "imported": 1,
    "skipped": 0,
    "failed": 0
  },
  "message": "导入完成：成功 1 个，跳过 0 个，失败 0 个"
}
```

#### 7.3 测试导入 API（替换模式）
```bash
curl -X POST http://localhost:3000/api/links/import \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "replace",
    "links": [
      {
        "url": "https://example.com",
        "title": "测试链接"
      }
    ]
  }'
```

**预期响应**：
```json
{
  "success": true,
  "data": {
    "imported": 1,
    "skipped": 0,
    "failed": 0,
    "deleted": 5
  },
  "message": "导入完成：成功 1 个，跳过 0 个，失败 0 个，删除 5 个"
}
```

---

## 📊 测试结果记录表

| 测试项 | 状态 | 备注 |
|--------|------|------|
| 导出功能 | ⬜ 待测试 | |
| 导入-追加模式 | ⬜ 待测试 | |
| 导入-去重功能 | ⬜ 待测试 | |
| 导入-替换模式 | ⬜ 待测试 | |
| 错误处理-文件类型 | ⬜ 待测试 | |
| 错误处理-JSON格式 | ⬜ 待测试 | |
| 错误处理-缺少字段 | ⬜ 待测试 | |
| UI交互-按钮状态 | ⬜ 待测试 | |
| UI交互-模式切换 | ⬜ 待测试 | |
| UI交互-Toast提示 | ⬜ 待测试 | |

---

## 🐛 已知问题

目前暂无已知问题。

---

## 📝 测试样本数据

**最小测试数据（test-minimal.json）**：
```json
{
  "version": "1.0",
  "exportDate": "2026-01-16T12:00:00.000Z",
  "totalLinks": 2,
  "links": [
    {
      "url": "https://github.com",
      "title": "GitHub"
    },
    {
      "url": "https://google.com",
      "title": "Google"
    }
  ]
}
```

**完整测试数据（test-full.json）**：
```json
{
  "version": "1.0",
  "exportDate": "2026-01-16T12:00:00.000Z",
  "totalLinks": 3,
  "links": [
    {
      "url": "https://github.com",
      "title": "GitHub",
      "description": "全球最大的代码托管平台",
      "icon": "https://github.com/favicon.ico",
      "category": "开发工具",
      "isPublic": true
    },
    {
      "url": "https://google.com",
      "title": "Google",
      "description": "全球最大的搜索引擎",
      "icon": "https://google.com/favicon.ico",
      "category": "搜索引擎",
      "isPublic": false
    },
    {
      "url": "https://stackoverflow.com",
      "title": "Stack Overflow",
      "description": "程序员问答社区",
      "icon": "https://stackoverflow.com/favicon.ico",
      "category": "开发工具",
      "isPublic": true
    }
  ]
}
```

**错误测试数据（test-invalid.json）**：
```json
{
  "version": "1.0",
  "exportDate": "2026-01-16T12:00:00.000Z",
  "totalLinks": 2,
  "links": [
    {
      "url": "https://example.com",
      "title": "有效链接"
    },
    {
      "url": "https://invalid.com"
      // 缺少 title 字段
    }
  ]
}
```

---

## ✅ 测试完成标准

- ✅ 所有测试用例通过
- ✅ 无控制台错误
- ✅ UI 交互流畅
- ✅ Toast 提示正确
- ✅ 数据完整性验证通过
- ✅ 错误处理正确

---

**测试日期**：待完成  
**测试人员**：待分配  
**测试环境**：开发环境 (localhost:3000)

