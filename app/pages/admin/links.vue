<script setup lang="ts">
import type { Link } from '~/composables/useLinks'

definePageMeta({
  middleware: 'auth',
  layout: 'admin',
})

const { links, pagination, loading, fetchLinks, createLink, updateLink, deleteLink } = useLinks()
const route = useRoute()
const router = useRouter()
const toast = useToast()

// 分页和筛选参数
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const selectedCategory = ref<string>('')
const sortBy = ref<'createdAt' | 'clicks' | 'title'>('createdAt')
const sortOrder = ref<'asc' | 'desc'>('desc')

// 加载数据
const loadLinks = async () => {
  await fetchLinks({
    page: currentPage.value,
    pageSize: pageSize.value,
    search: searchQuery.value || undefined,
    category: selectedCategory.value && selectedCategory.value !== '全部分类' ? selectedCategory.value : undefined,
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
  })
}

// 初始加载
onMounted(async () => {
  await loadLinks()
  
  // 如果URL中有action=add参数，自动打开添加对话框
  if (route.query.action === 'add') {
    showAddModal.value = true
    // 清除URL参数
    router.replace({ query: {} })
  }
})

// 监听筛选和排序变化，重新加载数据
watch([searchQuery, selectedCategory, sortBy, sortOrder], () => {
  currentPage.value = 1 // 重置到第一页
  loadLinks()
})

// 监听分页变化
watch(currentPage, () => {
  loadLinks()
})

// 分类列表 - 需要从所有链接中获取，不受分页影响
const allCategories = ref<string[]>([])

// 获取所有分类（独立请求，不分页）
const fetchAllCategories = async () => {
  // 获取所有链接数据以获取分类列表
  const { fetchLinks } = useLinks()
  const response = await $fetch<any>('/api/links?all=true', {
    headers: {
      Authorization: `Bearer ${useAuth().accessToken.value}`,
    },
  })
  
  if (response.success && response.data) {
    const categories = new Set<string>()
    response.data.forEach((link: any) => {
      if (link.category) categories.add(link.category)
    })
    allCategories.value = Array.from(categories).sort()
  }
}

// 初始加载所有分类
onMounted(() => {
  fetchAllCategories()
})

// 分类选项（用于下拉菜单）
const categoryOptions = computed(() => {
  return [
    '全部分类',
    ...allCategories.value
  ]
})

// 表单分类选项（用于新建/编辑表单）
const formCategoryOptions = computed(() => {
  return allCategories.value
})

// 是否显示自定义分类输入框
const showCustomCategory = ref(false)

// 过滤和排序后的链接 - 现在由后端处理，直接使用返回的数据
const filteredLinks = computed(() => {
  return links.value
})

// 自动获取图标
const fetchingIcon = ref(false)
const fetchIconFromUrl = async () => {
  if (!form.value.url) {
    toast.add({
      title: '提示',
      description: '请先填写 URL',
      color: 'warning',
    })
    return
  }

  // 验证 URL 格式
  let url: URL
  try {
    url = new URL(form.value.url)
  } catch (error) {
    toast.add({
      title: '错误',
      description: 'URL 格式不正确',
      color: 'error',
    })
    return
  }

  fetchingIcon.value = true
  
  try {
    // 方法1: 使用 Google Favicon 服务（最可靠）
    const domain = url.hostname
    const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
    
    // 测试图标是否可访问
    const img = new Image()
    img.onload = () => {
      form.value.icon = googleFaviconUrl
      toast.add({
        title: '成功',
        description: '图标已自动获取',
        color: 'success',
      })
      fetchingIcon.value = false
    }
    img.onerror = () => {
      // 如果 Google 服务失败，尝试使用 favicon.ico
      const fallbackUrl = `${url.protocol}//${url.hostname}/favicon.ico`
      form.value.icon = fallbackUrl
      toast.add({
        title: '提示',
        description: '已使用默认图标路径，请检查是否正确显示',
        color: 'warning',
      })
      fetchingIcon.value = false
    }
    img.src = googleFaviconUrl
  } catch (error) {
    toast.add({
      title: '失败',
      description: '无法获取网站图标',
      color: 'error',
    })
    fetchingIcon.value = false
  }
}

// 模态框状态
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const currentLink = ref<Link | null>(null)

// 表单数据
const form = ref({
  url: '',
  title: '',
  description: '',
  icon: '',
  category: '',
  isPublic: false,
})

// 重置表单
const resetForm = () => {
  form.value = {
    url: '',
    title: '',
    description: '',
    icon: '',
    category: '',
    isPublic: false,
  }
}

// 打开添加模态框
const openAddModal = () => {
  resetForm()
  showCustomCategory.value = false
  showAddModal.value = true
}

// 打开编辑模态框
const openEditModal = (link: Link) => {
  currentLink.value = link
  form.value = {
    url: link.url,
    title: link.title,
    description: link.description || '',
    icon: link.icon || '',
    category: link.category || '',
    isPublic: link.isPublic,
  }
  // 如果当前分类不在列表中，显示自定义输入框
  showCustomCategory.value = !!link.category && !allCategories.value.includes(link.category)
  showEditModal.value = true
}

// 打开删除确认框
const openDeleteModal = (link: Link) => {
  currentLink.value = link
  showDeleteModal.value = true
}

// 添加链接
const saving = ref(false)
const handleAdd = async () => {
  if (!form.value.url || !form.value.title) {
    toast.add({
      title: '错误',
      description: 'URL 和标题不能为空',
      color: 'error',
    })
    return
  }

  saving.value = true
  const result = await createLink({
    url: form.value.url,
    title: form.value.title,
    description: form.value.description || undefined,
    icon: form.value.icon || undefined,
    category: form.value.category || undefined,
    isPublic: form.value.isPublic,
  })
  saving.value = false

  if (result?.success) {
    toast.add({
      title: '成功',
      description: '链接已添加',
      color: 'success',
    })
    showAddModal.value = false
    resetForm()
    // 重新加载当前页数据
    await loadLinks()
  } else {
    toast.add({
      title: '失败',
      description: result?.message || '添加失败',
      color: 'error',
    })
  }
}

// 更新链接
const handleUpdate = async () => {
  if (!currentLink.value || !form.value.url || !form.value.title) {
    toast.add({
      title: '错误',
      description: 'URL 和标题不能为空',
      color: 'error',
    })
    return
  }

  saving.value = true
  const result = await updateLink(currentLink.value.id, {
    url: form.value.url,
    title: form.value.title,
    description: form.value.description || undefined,
    icon: form.value.icon || undefined,
    category: form.value.category || undefined,
    isPublic: form.value.isPublic,
  })
  saving.value = false

  if (result?.success) {
    toast.add({
      title: '成功',
      description: '链接已更新',
      color: 'success',
    })
    showEditModal.value = false
    currentLink.value = null
    // 重新加载当前页数据
    await loadLinks()
  } else {
    toast.add({
      title: '失败',
      description: result?.message || '更新失败',
      color: 'error',
    })
  }
}

// 删除链接
const deleting = ref(false)
const handleDelete = async () => {
  if (!currentLink.value) return

  deleting.value = true
  const result = await deleteLink(currentLink.value.id)
  deleting.value = false

  if (result?.success) {
    toast.add({
      title: '成功',
      description: '链接已删除',
      color: 'success',
    })
    showDeleteModal.value = false
    currentLink.value = null
    // 重新加载当前页数据
    await loadLinks()
  } else {
    toast.add({
      title: '失败',
      description: result?.message || '删除失败',
      color: 'error',
    })
  }
}

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}
</script>

<template>
  <div>
    <!-- 页面标题和操作 -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-bold mb-2">链接管理</h1>
        <p class="text-gray-600 dark:text-gray-400">
          共 {{ links.length }} 个链接，{{ filteredLinks.length }} 个结果
        </p>
      </div>

      <UButton
        color="primary"
        icon="i-mdi-plus"
        size="lg"
        @click="openAddModal"
      >
        添加链接
      </UButton>
    </div>

    <!-- 搜索和筛选 -->
    <UCard class="mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- 搜索 -->
        <div class="md:col-span-2">
          <UInput
            v-model="searchQuery"
            placeholder="搜索标题、URL或描述..."
            icon="i-mdi-magnify"
            size="lg"
            clearable
          />
        </div>

        <!-- 分类筛选 -->
        <USelectMenu
          v-model="selectedCategory"
          :items="categoryOptions"
          placeholder="全部分类"
          size="lg"
        >
          <UButton
            icon="i-mdi-tag"
            :label="selectedCategory || '全部分类'"
            trailing-icon="i-mdi-chevron-down"
            color="neutral"
            variant="outline"
            size="lg"
            block
          />
        </USelectMenu>
      </div>

      <!-- 排序栏 -->
      <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">排序方式：</span>
          <div class="flex items-center gap-2">
            <UButton
              :variant="sortBy === 'createdAt' ? 'solid' : 'ghost'"
              :color="sortBy === 'createdAt' ? 'primary' : 'neutral'"
              size="sm"
              @click="sortBy = 'createdAt'"
            >
              创建时间
            </UButton>
            <UButton
              :variant="sortBy === 'clicks' ? 'solid' : 'ghost'"
              :color="sortBy === 'clicks' ? 'primary' : 'neutral'"
              size="sm"
              @click="sortBy = 'clicks'"
            >
              点击量
            </UButton>
            <UButton
              :variant="sortBy === 'title' ? 'solid' : 'ghost'"
              :color="sortBy === 'title' ? 'primary' : 'neutral'"
              size="sm"
              @click="sortBy = 'title'"
            >
              标题
            </UButton>
          </div>
        </div>

        <UButton
          :icon="sortOrder === 'asc' ? 'i-mdi-sort-ascending' : 'i-mdi-sort-descending'"
          variant="ghost"
          size="sm"
          @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
        >
          {{ sortOrder === 'asc' ? '升序' : '降序' }}
        </UButton>
      </div>
    </UCard>

    <!-- 加载状态 -->
    <div v-if="loading" class="text-center py-12">
      <UIcon name="i-mdi-loading" class="animate-spin text-4xl text-primary" />
      <p class="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
    </div>

    <!-- 空状态 -->
    <div v-else-if="filteredLinks.length === 0" class="text-center py-12">
      <div class="inline-block p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
        <UIcon name="i-mdi-link-variant-off" class="text-5xl text-gray-400" />
      </div>
      <h3 class="text-xl font-semibold mb-2">
        {{ searchQuery || (selectedCategory && selectedCategory !== '全部分类') ? '没有找到链接' : '还没有链接' }}
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        {{ searchQuery || (selectedCategory && selectedCategory !== '全部分类') ? '尝试调整筛选条件' : '开始添加您的第一个链接吧' }}
      </p>
      <UButton v-if="!searchQuery && (!selectedCategory || selectedCategory === '全部分类')" color="primary" icon="i-mdi-plus" @click="openAddModal">
        添加链接
      </UButton>
    </div>

    <!-- 链接列表 - 表格样式 -->
    <UCard v-else>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th class="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                图标
              </th>
              <th class="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                标题 & URL
              </th>
              <th class="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                分类
              </th>
              <th class="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                点击量
              </th>
              <th class="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                状态
              </th>
              <th class="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                创建时间
              </th>
              <th class="text-right py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="link in filteredLinks"
              :key="link.id"
              class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <!-- 图标 -->
              <td class="py-3 px-4">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center">
                  <img
                    v-if="link.icon"
                    :src="link.icon"
                    :alt="link.title"
                    class="w-6 h-6 rounded"
                    @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
                  />
                  <UIcon v-else name="i-mdi-web" class="text-xl text-blue-600 dark:text-blue-400" />
                </div>
              </td>

              <!-- 标题 & URL -->
              <td class="py-3 px-4 max-w-md">
                <div class="flex flex-col gap-1">
                  <span class="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {{ link.title }}
                  </span>
                  <a
                    :href="link.url"
                    target="_blank"
                    class="text-xs text-blue-600 dark:text-blue-400 hover:underline truncate"
                  >
                    {{ link.url }}
                  </a>
                  <p v-if="link.description" class="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                    {{ link.description }}
                  </p>
                </div>
              </td>

              <!-- 分类 -->
              <td class="py-3 px-4">
                <UBadge
                  v-if="link.category"
                  color="neutral"
                  variant="soft"
                  size="sm"
                >
                  {{ link.category }}
                </UBadge>
                <span v-else class="text-xs text-gray-400">-</span>
              </td>

              <!-- 点击量 -->
              <td class="py-3 px-4">
                <div class="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <UIcon name="i-mdi-chart-line" class="text-base" />
                  <span>{{ link.clicks }}</span>
                </div>
              </td>

              <!-- 状态 -->
              <td class="py-3 px-4">
                <UBadge
                  :color="link.isPublic ? 'success' : 'neutral'"
                  variant="soft"
                  size="sm"
                >
                  <template #leading>
                    <UIcon :name="link.isPublic ? 'i-mdi-earth' : 'i-mdi-lock'" />
                  </template>
                  {{ link.isPublic ? '公开' : '私密' }}
                </UBadge>
              </td>

              <!-- 创建时间 -->
              <td class="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                {{ formatDate(link.createdAt) }}
              </td>

              <!-- 操作 -->
              <td class="py-3 px-4">
                <div class="flex items-center justify-end gap-1">
                  <UButton
                    icon="i-mdi-pencil"
                    variant="ghost"
                    color="neutral"
                    size="sm"
                    @click="openEditModal(link)"
                  />
                  <UButton
                    icon="i-mdi-delete"
                    variant="ghost"
                    color="error"
                    size="sm"
                    @click="openDeleteModal(link)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <!-- 分页 -->
    <div v-if="!loading && filteredLinks.length > 0" class="mt-6 flex justify-center">
      <UPagination
        v-model:page="currentPage"
        :total="pagination.total"
        :items-per-page="pageSize"
        :sibling-count="1"
        show-edges
      />
    </div>

    <!-- 添加链接模态框 -->
    <UModal v-model:open="showAddModal" title="添加链接">
      <template #body>
        <form @submit.prevent="handleAdd" class="space-y-5">
          <!-- 基本信息 -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <UIcon name="i-mdi-information" />
              基本信息
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium mb-2">
                  URL <span class="text-red-500">*</span>
                </label>
                <UInput
                  v-model="form.url"
                  placeholder="https://example.com"
                  size="lg"
                  icon="i-mdi-link"
                  required
                />
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium mb-2">
                  标题 <span class="text-red-500">*</span>
                </label>
                <UInput
                  v-model="form.title"
                  placeholder="链接标题"
                  size="lg"
                  icon="i-mdi-format-title"
                  required
                />
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium mb-2">描述</label>
                <UTextarea
                  v-model="form.description"
                  placeholder="简短描述这个链接的内容..."
                  :rows="3"
                />
              </div>
            </div>
          </div>

          <!-- 分类和图标 -->
          <div class="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <UIcon name="i-mdi-tag" />
              分类和外观
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">分类</label>
                <div class="space-y-2">
                  <USelectMenu
                    v-if="!showCustomCategory"
                    v-model="form.category"
                    :items="formCategoryOptions"
                    placeholder="选择已有分类"
                    size="lg"
                    clearable
                  >
                    <template #trailing>
                      <UButton
                        icon="i-mdi-pencil"
                        variant="ghost"
                        color="neutral"
                        size="xs"
                        @click.stop="showCustomCategory = true"
                      />
                    </template>
                  </USelectMenu>
                  
                  <UInput
                    v-else
                    v-model="form.category"
                    placeholder="输入新分类名称"
                    size="lg"
                    icon="i-mdi-tag"
                  >
                    <template #trailing>
                      <UButton
                        v-if="formCategoryOptions.length > 0"
                        icon="i-mdi-arrow-left"
                        variant="ghost"
                        color="neutral"
                        size="xs"
                        @click="showCustomCategory = false"
                      />
                    </template>
                  </UInput>
                  
                  <div class="flex items-center justify-between">
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ showCustomCategory ? '输入新分类' : '从现有分类中选择' }}
                    </p>
                    <UButton
                      v-if="!showCustomCategory && formCategoryOptions.length > 0"
                      variant="link"
                      size="xs"
                      @click="showCustomCategory = true"
                    >
                      + 新建分类
                    </UButton>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">图标URL</label>
                <div class="flex gap-2">
                  <UInput
                    v-model="form.icon"
                    placeholder="https://example.com/icon.png"
                    size="lg"
                    icon="i-mdi-image"
                    class="flex-1"
                  />
                  <UButton
                    icon="i-mdi-auto-fix"
                    color="neutral"
                    variant="outline"
                    size="lg"
                    :loading="fetchingIcon"
                    :disabled="!form.url || fetchingIcon"
                    @click="fetchIconFromUrl"
                  >
                    自动获取
                  </UButton>
                </div>
                <div class="flex items-center justify-between mt-1">
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    可选，用于显示网站图标
                  </p>
                  <!-- 图标预览 -->
                  <div v-if="form.icon" class="flex items-center gap-2">
                    <span class="text-xs text-gray-500 dark:text-gray-400">预览:</span>
                    <img 
                      :src="form.icon" 
                      alt="icon preview" 
                      class="w-6 h-6 rounded"
                      @error="(e) => (e.target as HTMLImageElement).style.opacity = '0.3'"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 可见性设置 -->
          <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
              <UIcon name="i-mdi-eye" />
              可见性设置
            </h3>
            
            <div class="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <UCheckbox v-model="form.isPublic" />
              <div class="flex-1">
                <label class="text-sm font-medium cursor-pointer" @click="form.isPublic = !form.isPublic">
                  设为公开链接
                </label>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  公开后，其他用户可以在首页的"网页推荐"中看到这个链接
                </p>
              </div>
            </div>
          </div>
        </form>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" @click="showAddModal = false">
            取消
          </UButton>
          <UButton color="primary" icon="i-mdi-check" :loading="saving" :disabled="saving" @click="handleAdd">
            {{ saving ? '添加中...' : '添加链接' }}
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- 编辑链接模态框 -->
    <UModal v-model:open="showEditModal" title="编辑链接">
      <template #body>
        <form @submit.prevent="handleUpdate" class="space-y-5">
          <!-- 基本信息 -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <UIcon name="i-mdi-information" />
              基本信息
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium mb-2">
                  URL <span class="text-red-500">*</span>
                </label>
                <UInput
                  v-model="form.url"
                  placeholder="https://example.com"
                  size="lg"
                  icon="i-mdi-link"
                  required
                />
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium mb-2">
                  标题 <span class="text-red-500">*</span>
                </label>
                <UInput
                  v-model="form.title"
                  placeholder="链接标题"
                  size="lg"
                  icon="i-mdi-format-title"
                  required
                />
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium mb-2">描述</label>
                <UTextarea
                  v-model="form.description"
                  placeholder="简短描述这个链接的内容..."
                  :rows="3"
                />
              </div>
            </div>
          </div>

          <!-- 分类和图标 -->
          <div class="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <UIcon name="i-mdi-tag" />
              分类和外观
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">分类</label>
                <div class="space-y-2">
                  <USelectMenu
                    v-if="!showCustomCategory"
                    v-model="form.category"
                    :items="formCategoryOptions"
                    placeholder="选择已有分类"
                    size="lg"
                    clearable
                  >
                    <template #trailing>
                      <UButton
                        icon="i-mdi-pencil"
                        variant="ghost"
                        color="neutral"
                        size="xs"
                        @click.stop="showCustomCategory = true"
                      />
                    </template>
                  </USelectMenu>
                  
                  <UInput
                    v-else
                    v-model="form.category"
                    placeholder="输入新分类名称"
                    size="lg"
                    icon="i-mdi-tag"
                  >
                    <template #trailing>
                      <UButton
                        v-if="formCategoryOptions.length > 0"
                        icon="i-mdi-arrow-left"
                        variant="ghost"
                        color="neutral"
                        size="xs"
                        @click="showCustomCategory = false"
                      />
                    </template>
                  </UInput>
                  
                  <div class="flex items-center justify-between">
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ showCustomCategory ? '输入新分类' : '从现有分类中选择' }}
                    </p>
                    <UButton
                      v-if="!showCustomCategory && formCategoryOptions.length > 0"
                      variant="link"
                      size="xs"
                      @click="showCustomCategory = true"
                    >
                      + 新建分类
                    </UButton>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">图标URL</label>
                <div class="flex gap-2">
                  <UInput
                    v-model="form.icon"
                    placeholder="https://example.com/icon.png"
                    size="lg"
                    icon="i-mdi-image"
                    class="flex-1"
                  />
                  <UButton
                    icon="i-mdi-auto-fix"
                    color="neutral"
                    variant="outline"
                    size="lg"
                    :loading="fetchingIcon"
                    :disabled="!form.url || fetchingIcon"
                    @click="fetchIconFromUrl"
                  >
                    自动获取
                  </UButton>
                </div>
                <div class="flex items-center justify-between mt-1">
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    可选，用于显示网站图标
                  </p>
                  <!-- 图标预览 -->
                  <div v-if="form.icon" class="flex items-center gap-2">
                    <span class="text-xs text-gray-500 dark:text-gray-400">预览:</span>
                    <img 
                      :src="form.icon" 
                      alt="icon preview" 
                      class="w-6 h-6 rounded"
                      @error="(e) => (e.target as HTMLImageElement).style.opacity = '0.3'"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 可见性设置 -->
          <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
              <UIcon name="i-mdi-eye" />
              可见性设置
            </h3>
            
            <div class="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <UCheckbox v-model="form.isPublic" />
              <div class="flex-1">
                <label class="text-sm font-medium cursor-pointer" @click="form.isPublic = !form.isPublic">
                  设为公开链接
                </label>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  公开后，其他用户可以在首页的"网页推荐"中看到这个链接
                </p>
              </div>
            </div>
          </div>
        </form>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" @click="showEditModal = false">
            取消
          </UButton>
          <UButton color="primary" icon="i-mdi-content-save" :loading="saving" :disabled="saving" @click="handleUpdate">
            {{ saving ? '保存中...' : '保存更改' }}
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- 删除确认模态框 -->
    <UModal v-model:open="showDeleteModal" title="确认删除">
      <template #body>
        <div class="space-y-4">
          <p>确定要删除以下链接吗？此操作不可恢复。</p>
          <div v-if="currentLink" class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p class="font-semibold">{{ currentLink.title }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400 truncate">
              {{ currentLink.url }}
            </p>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" @click="showDeleteModal = false">
            取消
          </UButton>
          <UButton color="error" :loading="deleting" :disabled="deleting" @click="handleDelete">
            删除
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

