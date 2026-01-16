<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'admin',
})

const { user } = useAuth()
const { links, loading, fetchLinks } = useLinks()

// 加载数据
onMounted(() => {
  fetchLinks()
})

// 统计数据
const stats = computed(() => {
  const totalClicks = links.value.reduce((sum, link) => sum + link.clicks, 0)
  const publicLinks = links.value.filter(link => link.isPublic).length
  const categories = new Set(links.value.map(link => link.category).filter(Boolean)).size

  return {
    totalLinks: links.value.length,
    publicLinks,
    privateLinks: links.value.length - publicLinks,
    totalClicks,
    categories,
  }
})

// 最近的链接
const recentLinks = computed(() => {
  return [...links.value]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
})

// 热门链接
const popularLinks = computed(() => {
  return [...links.value]
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5)
})

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// 格式化相对时间
const formatRelativeTime = (date: string) => {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diffInSeconds < 60) return '刚刚'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} 分钟前`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} 小时前`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} 天前`
  return formatDate(date)
}
</script>

<template>
  <div>
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold mb-2">
        欢迎回来，{{ user?.name || user?.email?.split('@')[0] }}！
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        这是您的管理后台概览，可以快速查看和管理您的内容
      </p>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">总链接数</p>
            <p class="text-3xl font-bold">{{ stats.totalLinks }}</p>
          </div>
          <div class="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <UIcon name="i-mdi-link-variant" class="text-2xl text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">公开链接</p>
            <p class="text-3xl font-bold">{{ stats.publicLinks }}</p>
          </div>
          <div class="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
            <UIcon name="i-mdi-earth" class="text-2xl text-green-600 dark:text-green-400" />
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">总点击量</p>
            <p class="text-3xl font-bold">{{ stats.totalClicks }}</p>
          </div>
          <div class="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <UIcon name="i-mdi-chart-line" class="text-2xl text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">分类数</p>
            <p class="text-3xl font-bold">{{ stats.categories }}</p>
          </div>
          <div class="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
            <UIcon name="i-mdi-tag-multiple" class="text-2xl text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
      </UCard>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="text-center py-12">
      <UIcon name="i-mdi-loading" class="animate-spin text-4xl text-primary" />
      <p class="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
    </div>

    <!-- 数据展示 -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 最近添加 -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold flex items-center gap-2">
              <UIcon name="i-mdi-clock" />
              最近添加
            </h2>
            <UButton to="/admin/links" variant="ghost" size="xs">
              查看全部
            </UButton>
          </div>
        </template>

        <div v-if="recentLinks.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
          <UIcon name="i-mdi-link-variant-off" class="text-4xl mb-2" />
          <p>还没有链接</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="link in recentLinks"
            :key="link.id"
            class="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div class="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <img
                v-if="link.icon"
                :src="link.icon"
                :alt="link.title"
                class="w-6 h-6 rounded"
                @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
              />
              <UIcon v-else name="i-mdi-web" class="text-xl text-blue-600 dark:text-blue-400" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-medium truncate">{{ link.title }}</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {{ formatRelativeTime(link.createdAt) }}
              </p>
            </div>
            <UBadge
              :color="link.isPublic ? 'success' : 'neutral'"
              variant="subtle"
              size="xs"
            >
              {{ link.isPublic ? '公开' : '私密' }}
            </UBadge>
          </div>
        </div>
      </UCard>

      <!-- 热门链接 -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold flex items-center gap-2">
              <UIcon name="i-mdi-fire" />
              热门链接
            </h2>
            <UButton to="/admin/links" variant="ghost" size="xs">
              查看全部
            </UButton>
          </div>
        </template>

        <div v-if="popularLinks.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
          <UIcon name="i-mdi-chart-line-variant" class="text-4xl mb-2" />
          <p>还没有点击数据</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="(link, index) in popularLinks"
            :key="link.id"
            class="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div class="w-10 h-10 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-lg">
              {{ index + 1 }}
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-medium truncate">{{ link.title }}</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                <UIcon name="i-mdi-chart-line" />
                {{ link.clicks }} 次点击
              </p>
            </div>
            <UBadge
              v-if="link.category"
              color="primary"
              variant="subtle"
              size="xs"
            >
              {{ link.category }}
            </UBadge>
          </div>
        </div>
      </UCard>
    </div>

    <!-- 快速操作 -->
    <UCard class="mt-6">
      <template #header>
        <h2 class="text-lg font-semibold flex items-center gap-2">
          <UIcon name="i-mdi-lightning-bolt" />
          快速操作
        </h2>
      </template>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <UButton
          to="/admin/links?action=add"
          color="primary"
          variant="soft"
          block
          size="lg"
          icon="i-mdi-plus"
        >
          添加链接
        </UButton>

        <UButton
          to="/admin/profile"
          color="neutral"
          variant="soft"
          block
          size="lg"
          icon="i-mdi-account-edit"
        >
          编辑资料
        </UButton>

        <UButton
          to="/admin/links"
          color="neutral"
          variant="soft"
          block
          size="lg"
          icon="i-mdi-view-list"
        >
          管理链接
        </UButton>

        <UButton
          to="/admin/settings"
          color="neutral"
          variant="soft"
          block
          size="lg"
          icon="i-mdi-cog"
        >
          系统设置
        </UButton>
      </div>
    </UCard>
  </div>
</template>

