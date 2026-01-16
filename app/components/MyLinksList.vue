<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'

const { links, loading, fetchLinks, recordClick } = useLinks()

// 分类筛选
const selectedCategory = ref<string | null>(null)

// 懒加载配置
const pageSize = 20 // 每页显示20条
const currentPage = ref(1)
const hasMore = ref(true)
const loadingMore = ref(false)

// 当前显示的链接（懒加载）
const displayedLinks = ref<any[]>([])

// 分类列表
const categories = computed(() => {
  const cats = new Set<string>()
  links.value.forEach(link => {
    if (link.category) cats.add(link.category)
  })
  return Array.from(cats).sort()
})

// 过滤后的链接
const filteredLinks = computed(() => {
  if (!selectedCategory.value) return links.value
  return links.value.filter(link => link.category === selectedCategory.value)
})

// 加载更多链接
const loadMore = () => {
  if (!hasMore.value || loadingMore.value) return
  
  loadingMore.value = true
  
  // 模拟异步加载（实际项目中可能是 API 调用）
  setTimeout(() => {
    const startIndex = (currentPage.value - 1) * pageSize
    const endIndex = startIndex + pageSize
    const newLinks = filteredLinks.value.slice(startIndex, endIndex)
    
    if (newLinks.length > 0) {
      displayedLinks.value.push(...newLinks)
      currentPage.value++
    }
    
    // 检查是否还有更多数据
    if (endIndex >= filteredLinks.value.length) {
      hasMore.value = false
    }
    
    loadingMore.value = false
  }, 300)
}

// 重置懒加载状态
const resetLazyLoad = () => {
  currentPage.value = 1
  displayedLinks.value = []
  hasMore.value = true
  loadMore()
}

// 监听过滤条件变化，重置列表
watch(selectedCategory, () => {
  resetLazyLoad()
})

// 监听links变化，重新加载
watch(() => links.value.length, (newLen, oldLen) => {
  if (newLen !== oldLen) {
    resetLazyLoad()
  }
}, { immediate: false })

// 节流记录点击
const throttledRecordClick = useThrottleFn((linkId: number) => {
  recordClick(linkId)
}, 1000)

// 处理链接点击
const handleLinkClick = (link: any) => {
  window.open(link.url, '_blank')
  throttledRecordClick(link.id)
}

// 懒加载触发器元素
const loadMoreTrigger = ref<HTMLElement | null>(null)

// 使用 IntersectionObserver 监听触发器
useIntersectionObserver(
  loadMoreTrigger,
  (entries) => {
    const entry = entries[0]
    if (entry && entry.isIntersecting && hasMore.value && !loadingMore.value) {
      loadMore()
    }
  },
  {
    threshold: 0.1,
  }
)

// 组件挂载时加载数据
onMounted(() => {
  fetchLinks({ all: true }).then(() => {
    resetLazyLoad()
  })
})
</script>

<template>
  <div class="my-links-container">
    <!-- 顶部工具栏 -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <!-- 分类筛选 -->
      <div v-if="categories.length > 0" class="flex flex-wrap items-center gap-2">
        <UButton 
          size="sm" 
          :variant="selectedCategory === null ? 'solid' : 'outline'"
          :color="selectedCategory === null ? 'primary' : 'neutral'" 
          @click="selectedCategory = null"
          class="transition-all duration-200"
        >
          全部
        </UButton>
        <UButton 
          v-for="cat in categories" 
          :key="cat" 
          size="sm"
          :variant="selectedCategory === cat ? 'solid' : 'outline'"
          :color="selectedCategory === cat ? 'primary' : 'neutral'" 
          @click="selectedCategory = cat"
          class="transition-all duration-200"
        >
          {{ cat }}
        </UButton>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <UIcon name="i-mdi-loading" class="animate-spin text-5xl text-primary mb-4" />
        <p class="text-gray-600 dark:text-gray-400">加载中...</p>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="links.length === 0" class="text-center py-20">
      <div
        class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-2xl mb-6">
        <UIcon name="i-mdi-link-variant-off" class="text-5xl text-gray-400" />
      </div>
      <h3 class="text-xl font-semibold mb-2">还没有链接</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
        开始添加您喜欢的网站链接，打造专属的个人导航页面
      </p>
      <UButton to="/admin/links" color="primary" size="lg" icon="i-mdi-plus">
        添加第一个链接
      </UButton>
    </div>

    <!-- 链接网格 -->
    <div v-else>
      <TransitionGroup 
        name="list" 
        tag="div" 
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        <UCard 
          v-for="link in displayedLinks" 
          :key="link.id"
          class="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group animate-fade-in"
          @click="handleLinkClick(link)"
        >
          <div class="flex flex-col h-full">
            <!-- 图标和标题 -->
            <div class="flex items-start gap-3 mb-3">
              <div
                class="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                <img 
                  v-if="link.icon" 
                  :src="link.icon" 
                  :alt="link.title" 
                  class="w-8 h-8 rounded"
                  @error="(e) => (e.target as HTMLImageElement).style.display = 'none'" 
                />
                <UIcon v-else name="i-mdi-web" class="text-2xl text-blue-600 dark:text-blue-400" />
              </div>
              <div class="flex-1 min-w-0">
                <h3
                  class="font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
                  {{ link.title }}
                </h3>
                <p v-if="link.category" class="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                  <UIcon name="i-mdi-tag" class="text-xs" />
                  {{ link.category }}
                </p>
              </div>
            </div>

            <!-- 描述 -->
            <p v-if="link.description" class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 flex-1">
              {{ link.description }}
            </p>

            <!-- 底部信息 -->
            <div
              class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
              <span class="flex items-center gap-1">
                <UIcon name="i-mdi-chart-line" />
                {{ link.clicks }} 次
              </span>
              <UBadge :color="link.isPublic ? 'success' : 'neutral'" variant="subtle" size="xs">
                <template #leading>
                  <UIcon :name="link.isPublic ? 'i-mdi-earth' : 'i-mdi-lock'" />
                </template>
                {{ link.isPublic ? '公开' : '私密' }}
              </UBadge>
            </div>
          </div>
        </UCard>
      </TransitionGroup>

      <!-- 懒加载触发器 -->
      <div ref="loadMoreTrigger" class="py-8 mt-4">
        <div v-if="loadingMore" class="flex justify-center">
          <div class="flex items-center gap-2 text-secondary-600 dark:text-secondary-400">
            <UIcon name="i-mdi-loading" class="animate-spin text-xl" />
            <span>加载更多...</span>
          </div>
        </div>
        <div v-else-if="!hasMore && displayedLinks.length > 0" class="text-center text-secondary-500 dark:text-secondary-400">
          <UIcon name="i-mdi-check-circle" class="text-xl" />
          <span class="ml-2">已加载全部 {{ displayedLinks.length }} 条链接</span>
        </div>
      </div>

      <!-- 更多操作 -->
      <div class="mt-8 text-center">
        <UButton to="/admin/links" variant="outline" size="lg">
          <template #leading>
            <UIcon name="i-mdi-cog" />
          </template>
          管理所有链接
        </UButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 列表过渡动画 */
.list-enter-active {
  transition: all 0.4s ease-out;
}

.list-leave-active {
  transition: all 0.3s ease-in;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.list-move {
  transition: transform 0.4s ease;
}
</style>
