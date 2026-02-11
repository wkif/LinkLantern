# 图标字段类型升级说明

## 问题
导入书签时遇到错误：
```
The provided value for the column is too long for the column's type. Column: icon
```

原因：图标字段 `icon` 原本是 `VarChar(500)`，但书签文件中的 base64 图标数据通常远超过 500 字符。

## 解决方案

### 1. 更新数据库 Schema

**修改前：**
```prisma
icon String? @db.VarChar(500)  // 最多 500 字符
```

**修改后：**
```prisma
icon String? @db.Text          // TEXT 类型，最多 65,535 字符
```

### 2. 执行数据库迁移

```bash
# 方案 A：使用 Prisma Migrate（推荐生产环境）
pnpm db:migrate

# 方案 B：直接推送（开发环境）
pnpm db:push

# 方案 C：手动执行 SQL
mysql -u用户名 -p数据库名 < prisma/migrations/20260211_icon_to_text/migration.sql
```

### 3. 后端智能处理

在 `import-bookmarks.post.ts` 中添加了智能图标处理：

```typescript
// 如果 base64 图标过大（>50KB），使用 favicon URL 代替
if (icon && icon.startsWith('data:') && icon.length > 50000) {
  icon = await fetchFavicon(bookmark.url)
}
```

## Base64 图标大小参考

| 图片类型 | 尺寸 | Base64 大小 |
|---------|------|------------|
| 小图标 | 16x16 PNG | ~500 字节 |
| 标准图标 | 32x32 PNG | ~2KB |
| 高清图标 | 64x64 PNG | ~8KB |
| 超大图标 | 128x128 PNG | ~30KB |

## 字段类型对比

| MySQL 类型 | 最大长度 | 存储空间 | 适用场景 |
|-----------|---------|---------|---------|
| VARCHAR(500) | 500 字符 | 500 字节 + 2 | ❌ 不够存 base64 |
| TEXT | 65,535 字符 | 实际长度 + 2 | ✅ 适合 base64 |
| MEDIUMTEXT | 16MB | 实际长度 + 3 | 过大，不推荐 |
| LONGTEXT | 4GB | 实际长度 + 4 | 过大，不推荐 |

## 迁移步骤

### 开发环境

```bash
# 1. 停止开发服务器
# 按 Ctrl+C

# 2. 推送 schema 变更
pnpm db:push

# 3. 重新生成 Prisma Client
pnpm prisma:generate

# 4. 重启开发服务器
pnpm dev
```

### 生产环境

```bash
# 1. 创建迁移
pnpm db:migrate

# 2. 部署时自动执行
# Vercel 会在 vercel-build 时执行 prisma migrate deploy
```

## 验证

迁移完成后，测试导入功能：

```bash
# 测试文件
test/bookmarks_2026_2_11.html

# 预期结果
✅ 成功导入 2 个书签
✅ 图标正常显示
```

## 回滚

如果需要回滚：

```sql
-- 改回 VARCHAR(500)，但会截断超长数据
ALTER TABLE `Link` MODIFY `icon` VARCHAR(500) NULL;
```

## 注意事项

1. **TEXT 类型不能有默认值**（MySQL 限制）
2. **TEXT 字段不建议建立索引**（性能考虑）
3. **存储空间会增加**（但对于图标字段影响不大）
4. **查询性能基本无影响**（图标字段很少用于查询条件）

## 相关文件

- `prisma/schema.prisma` - Schema 定义
- `prisma/migrations/20260211_icon_to_text/migration.sql` - 迁移 SQL
- `server/api/links/import-bookmarks.post.ts` - 导入逻辑
- `docs/DATABASE_LIMITS.md` - 数据库限制说明文档

## 最佳实践

**推荐的图标存储策略：**

1. **小图标（<10KB）** - 直接存储 base64
2. **中等图标（10-50KB）** - 存储 base64 或 URL
3. **大图标（>50KB）** - 转换为 favicon URL

**优势：**
- ✅ 减少数据库存储压力
- ✅ 提高查询性能
- ✅ 降低网络传输量
- ✅ 图标可以动态更新

---

**更新时间:** 2026-02-11  
**影响版本:** v1.0.0+
