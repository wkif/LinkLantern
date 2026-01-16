# 分页功能实现说明

## 功能概述

为管理员链接列表页面添加了完整的分页功能，支持服务端分页、筛选和排序。

## 实现内容

### 1. 后端 API 更新

**文件**: `server/api/links/index.get.ts`

新增查询参数：
- `page`: 当前页码（从1开始，默认1）
- `pageSize`: 每页条数（默认10）
- `sortBy`: 排序字段（createdAt, clicks, title）
- `sortOrder`: 排序方向（asc, desc）

返回数据结构：
```typescript
{
  success: true,
  data: Link[],
  pagination: {
    page: number,
    pageSize: number,
    total: number,
    totalPages: number
  }
}
```

### 2. Composable 更新

**文件**: `app/composables/useLinks.ts`

- 新增 `PaginationInfo` 接口
- `fetchLinks` 方法新增分页参数支持
- 导出 `pagination` 状态
- 移除 `createLink`、`updateLink`、`deleteLink` 中的自动刷新，由页面控制

### 3. 前端页面更新

**文件**: `app/pages/admin/links.vue`

主要改动：
- 新增分页状态管理（`currentPage`, `pageSize`）
- 添加 `loadLinks` 方法统一处理数据加载
- 使用 `watch` 监听筛选和分页变化，自动重新加载
- 搜索、分类、排序等筛选操作会重置到第一页
- 增删改操作后调用 `loadLinks` 刷新当前页
- 添加 `UPagination` 组件显示分页控件
- 移除前端筛选和排序逻辑，改为服务端处理

## 使用说明

### 分页控件

分页器位于链接列表底部，提供以下功能：
- 显示总页数
- 跳转到第一页/最后一页
- 上一页/下一页导航
- 显示当前页码周围的页码（sibling-count=1）
- 始终显示边缘页码（show-edges）

### 筛选联动

- **搜索**: 输入关键词筛选，自动返回第一页
- **分类筛选**: 选择分类后，自动返回第一页
- **排序**: 改变排序方式或顺序，保持当前页码
- **分页**: 切换页码，保持当前筛选条件

### 数据刷新

- **添加链接**: 添加成功后刷新当前页
- **编辑链接**: 更新成功后刷新当前页
- **删除链接**: 删除成功后刷新当前页

## 技术要点

### 1. 服务端分页

使用 Prisma 的 `skip` 和 `take` 实现：
```typescript
const skip = (page - 1) * pageSize
const take = pageSize

const links = await prisma.link.findMany({
  where,
  orderBy,
  skip,
  take,
})
```

### 2. 响应式更新

使用 Vue 3 的 `watch` API 监听筛选条件变化：
```typescript
watch([searchQuery, selectedCategory, sortBy, sortOrder], () => {
  currentPage.value = 1 // 重置到第一页
  loadLinks()
})

watch(currentPage, () => {
  loadLinks()
})
```

### 3. Nuxt UI 分页组件

```vue
<UPagination
  v-model:page="currentPage"
  :total="pagination.total"
  :items-per-page="pageSize"
  :sibling-count="1"
  show-edges
/>
```

## 性能优化

1. **减少数据传输**: 每次只加载当前页数据，而不是全部数据
2. **服务端处理**: 筛选、排序、分页都在数据库层面完成
3. **智能刷新**: 只在必要时重新加载数据，避免不必要的 API 调用

## 未来优化建议

1. **URL 状态同步**: 将当前页码、筛选条件保存到 URL 参数，支持浏览器前进/后退
2. **每页条数选择**: 允许用户选择每页显示 10/20/50 条
3. **虚拟滚动**: 对于超大数据集，可考虑使用虚拟滚动替代传统分页
4. **缓存优化**: 缓存已加载的页面数据，减少重复请求

## 测试建议

1. 创建超过 10 个链接测试分页显示
2. 测试不同筛选条件下的分页
3. 测试添加/编辑/删除后的数据刷新
4. 测试排序与分页的组合使用

