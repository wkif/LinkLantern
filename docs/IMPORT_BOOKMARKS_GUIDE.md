# 浏览器书签导入功能

## 📖 功能说明

LinkLantern 支持从 Chrome、Firefox、Edge、Safari 等主流浏览器导入书签，快速迁移您的收藏链接。

## ✨ 功能特性

### 支持的浏览器
- ✅ **Google Chrome**
- ✅ **Microsoft Edge**
- ✅ **Mozilla Firefox**
- ✅ **Safari**
- ✅ **Opera**
- ✅ **Brave**
- ✅ 其他基于 Chromium 的浏览器

### 支持的信息
- ✅ **URL** - 链接地址
- ✅ **标题** - 书签名称
- ✅ **分类** - 文件夹名称自动转为分类
- ✅ **图标** - 自动提取或获取 favicon
- ✅ **添加日期** - 保留原始添加时间

### 导入模式
1. **追加模式** (推荐)
   - 保留现有链接
   - 添加新书签
   - 自动跳过重复项（通过 URL 去重）

2. **替换模式** (谨慎使用)
   - 删除所有现有链接
   - 导入新书签
   - ⚠️ 操作不可撤销

## 📋 使用指南

### 第一步：从浏览器导出书签

#### Chrome / Edge / Brave
1. 点击浏览器右上角 **三点菜单** (⋮)
2. 选择 **书签** → **书签管理器**
3. 点击 **三点菜单** (⋮)
4. 选择 **导出书签**
5. 保存为 HTML 文件

**快捷方式:**
- Chrome: `chrome://bookmarks/` → 导出书签
- Edge: `edge://favorites/` → 导出收藏

#### Firefox
1. 点击菜单按钮 **☰**
2. 选择 **书签** → **管理书签**
3. 点击 **导入和备份**
4. 选择 **导出书签为 HTML**
5. 保存文件

**快捷方式:**
- Firefox: `Ctrl+Shift+O` (Windows) 或 `Cmd+Shift+O` (Mac)

#### Safari (macOS)
1. 在菜单栏选择 **文件** → **导出书签**
2. 选择保存位置
3. 保存为 HTML 文件

### 第二步：导入到 LinkLantern

1. 登录 LinkLantern 账户
2. 进入 **管理后台** → **链接管理**
3. 点击 **从浏览器导入** 按钮
4. 在弹出的对话框中：
   - 选择导入模式（追加/替换）
   - 点击上传区域选择书签 HTML 文件
5. 等待导入完成
6. 查看导入结果统计

## 🎯 书签文件格式说明

LinkLantern 支持标准的 Netscape Bookmark File Format，这是浏览器通用的书签导出格式。

### 标准格式示例

```html
<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <!-- 文件夹 -->
    <DT><H3>工作</H3>
    <DL><p>
        <!-- 书签 -->
        <DT><A HREF="https://github.com" ADD_DATE="1234567890" ICON="data:image/png;base64,...">GitHub</A>
        <DT><A HREF="https://stackoverflow.com">Stack Overflow</A>
    </DL><p>
    
    <!-- 嵌套文件夹 -->
    <DT><H3>学习</H3>
    <DL><p>
        <DT><H3>前端</H3>
        <DL><p>
            <DT><A HREF="https://vuejs.org">Vue.js</A>
            <DT><A HREF="https://nuxt.com">Nuxt</A>
        </DL><p>
    </DL><p>
</DL><p>
```

### 格式说明

- **`<H3>`** 标签表示文件夹（分类）
- **`<A HREF="...">`** 标签表示书签链接
- **`ADD_DATE`** 属性为添加时间（Unix 时间戳）
- **`ICON`** 属性为 base64 格式的图标

## 🔧 技术实现

### API 端点

**POST** `/api/links/import-bookmarks`

**请求体:**
```json
{
  "bookmarks": [
    {
      "url": "https://github.com",
      "title": "GitHub",
      "category": "工作",
      "icon": "data:image/png;base64,..."
    },
    {
      "url": "https://vuejs.org",
      "title": "Vue.js",
      "category": "前端开发"
    }
  ],
  "mode": "append"
}
```

**说明:**
- `bookmarks`: 前端已解析的书签数组
- `mode`: "append" 追加模式 或 "replace" 替换模式

**响应:**
```json
{
  "success": true,
  "message": "成功导入 50 个书签，跳过 5 个重复项",
  "data": {
    "imported": 50,
    "skipped": 5,
    "total": 55
  }
}
```

### 解析逻辑

1. **HTML 解析**
   - 使用正则表达式提取 `<DT>` 标签
   - 识别文件夹 (`<H3>`) 和链接 (`<A>`)
   - 维护文件夹栈追踪分类层级

2. **数据提取**
   - URL: 从 `HREF` 属性提取
   - 标题: 从 `<A>` 标签内容提取
   - 分类: 使用当前文件夹名称
   - 图标: 提取 `ICON` 属性或自动获取 favicon

3. **去重处理**
   - 基于 URL 去重
   - 追加模式下跳过已存在的链接
   - 替换模式下清空后导入

4. **批量导入**
   - 逐个创建链接记录
   - 错误处理和统计
   - 自动关联用户 ID

## 💡 使用技巧

### 1. 选择性导出

如果只想导入部分书签：
1. 在浏览器中创建一个临时文件夹
2. 将要导入的书签移动到该文件夹
3. 只导出这个文件夹
4. 完成后可以恢复原书签结构

### 2. 分类管理

- 浏览器文件夹名称会自动转为 LinkLantern 的分类
- 嵌套文件夹会使用最近的父文件夹作为分类
- 建议在导出前整理好文件夹结构

### 3. 图标处理

- 书签文件中的 base64 图标会被保留
- 如果图标过大（>10KB），会自动获取网站 favicon
- 导入后可以在链接管理页面手动调整

### 4. 重复处理

- 系统通过 URL 精确匹配检测重复
- 追加模式会自动跳过重复链接
- 查看导入结果可以了解跳过的数量

## ⚠️ 注意事项

### 文件大小限制
- 书签文件通常很小（<1MB）
- 如果文件过大，建议分批导出导入
- 大文件可能导致解析较慢

### 数据安全
- **替换模式会删除所有现有链接**
- 建议先使用导出功能备份现有数据
- 首次使用建议先用追加模式测试

### 图标处理
- Base64 图标会增加数据库大小
- 过大的图标会被替换为 favicon 链接
- 可以在导入后批量处理图标

### 浏览器兼容性
- 所有主流浏览器导出格式相同
- 某些浏览器可能包含特殊属性（会被忽略）
- 不支持的格式会提示错误

## 🐛 常见问题

### Q: 导入后为什么有些链接没有图标？
**A:** 可能的原因：
- 原书签文件中没有图标信息
- Base64 图标过大被跳过
- 网站的 favicon 获取失败

**解决方案:**
- 在链接管理页面使用"自动获取图标"功能
- 手动上传或设置图标 URL

### Q: 为什么有些链接被跳过？
**A:** 可能的原因：
- URL 已存在（追加模式下）
- URL 格式不正确
- 不是 http/https 链接

**解决方案:**
- 查看导入结果统计
- 检查原书签文件中的链接格式

### Q: 可以导入多次吗？
**A:** 可以，建议使用追加模式：
- 追加模式会自动去重
- 不会创建重复链接
- 可以分批导入不同的书签文件

### Q: 嵌套文件夹如何处理？
**A:** 使用最近的父文件夹作为分类：
```
工作/
  前端/
    Vue.js  → 分类：前端
    React   → 分类：前端
  后端/
    Node.js → 分类：后端
```

### Q: 导入需要多长时间？
**A:** 取决于书签数量：
- 100 个书签: 约 5-10 秒
- 500 个书签: 约 20-30 秒
- 1000+ 书签: 约 1-2 分钟

## 📊 性能建议

### 优化导入速度
1. **分批导入**: 大量书签分多次导入
2. **去除无用书签**: 导出前清理不需要的链接
3. **避免重复导入**: 使用追加模式自动去重

### 数据库优化
- 导入完成后系统会自动优化索引
- 大量导入后建议重新组织分类
- 定期清理不需要的链接

## 🔄 数据迁移场景

### 从其他平台迁移
1. 如果其他平台支持导出为 HTML 格式
2. 先导入到浏览器
3. 再从浏览器导出到 LinkLantern

### 更换设备
1. 在旧设备的浏览器导出书签
2. 在新设备登录 LinkLantern
3. 导入书签即可

### 团队共享
1. 团队成员各自导出书签
2. 创建团队账号
3. 导入合并后的书签文件

## 📝 API 文档

### 请求示例

```bash
curl -X POST https://your-domain.com/api/links/import-bookmarks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookmarks": [
      {
        "url": "https://github.com",
        "title": "GitHub",
        "category": "工作",
        "icon": "https://github.com/favicon.ico"
      }
    ],
    "mode": "append"
  }'
```

### 响应示例

**成功:**
```json
{
  "success": true,
  "message": "成功导入 50 个书签，跳过 5 个重复项",
  "data": {
    "imported": 50,
    "skipped": 5,
    "total": 55
  }
}
```

**失败:**
```json
{
  "success": false,
  "statusCode": 400,
  "statusMessage": "未能从文件中解析出有效的书签"
}
```

## 🎉 更新日志

### v1.0.0 (2026-02-11)
- ✅ 支持标准 HTML 书签格式
- ✅ 追加/替换两种导入模式
- ✅ 自动去重功能
- ✅ 文件夹自动转分类
- ✅ 图标自动提取和获取
- ✅ 批量导入优化
- ✅ 友好的进度反馈

## 🔗 相关文档

- [链接管理 API 文档](./LINK_GUIDE.md)
- [数据导入导出指南](./IMPORT_EXPORT_GUIDE.md)
- [管理后台使用指南](./ADMIN_GUIDE.md)

---

**提示:** 如果遇到任何问题，请查看常见问题部分或联系技术支持。
