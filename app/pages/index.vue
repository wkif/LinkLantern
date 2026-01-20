<script setup lang="ts">
import { useThrottleFn } from '@vueuse/core'

const { isLoggedIn, user, logout } = useAuth()
const { links, fetchLinks, recordClick, publicLinks, loadingPublic, fetchPublicLinks } = useLinks()
const { searchHistory, addToHistory, clearHistory, removeFromHistory, getSuggestions, fetchEngineSuggestions } = useSearch()
const router = useRouter()
const toast = useToast()

// 背景图片状态
const homeBackground = computed(() => user.value?.homeBackground || null)
const useBingWallpaper = computed(() => user.value?.useBingWallpaper || false)
const backgroundOpacity = computed(() => user.value?.backgroundOpacity || 80)
const backgroundBlur = computed(() => user.value?.backgroundBlur || 8)

// 必应壁纸 URL
const bingWallpaperUrl = 'https://uapis.cn/api/v1/image/bing-daily'

// 搜索相关
const searchQuery = ref('')
const selectedEngine = ref('google')
const showSuggestions = ref(false)
const selectedSuggestionIndex = ref(-1)
const engineSuggestions = ref<string[]>([])
const fetchingSuggestions = ref(false)

// 搜索引擎配置
const searchEngines = [
  { value: 'google', label: 'Google', icon: 'i-mdi-google', url: 'https://www.google.com/search?q=' },
  { value: 'bing', label: 'Bing', icon: 'i-mdi-microsoft-bing', url: 'https://www.bing.com/search?q=' },
  { value: 'baidu', label: '百度', icon: 'i-mdi-web', url: 'https://www.baidu.com/s?wd=' },
  { value: 'github', label: 'GitHub', icon: 'i-mdi-github', url: 'https://github.com/search?q=' },
]

// 防抖获取搜索引擎建议
let fetchTimer: NodeJS.Timeout | null = null
const debouncedFetchSuggestions = (query: string) => {
  if (fetchTimer) {
    clearTimeout(fetchTimer)
  }

  if (!query.trim()) {
    engineSuggestions.value = []
    return
  }

  fetchTimer = setTimeout(async () => {
    fetchingSuggestions.value = true
    try {
      engineSuggestions.value = await fetchEngineSuggestions(query, selectedEngine.value)
    } finally {
      fetchingSuggestions.value = false
    }
  }, 300) // 300ms 防抖
}

// 计算搜索建议
const suggestions = computed(() => {
  return getSuggestions(
    searchQuery.value, 
    Array.from(links.value),
    selectedEngine.value,
    engineSuggestions.value
  )
})

// Tab 状态管理（默认显示热榜，避免 hydration mismatch）
const activeTab = ref<'links' | 'hotboard'>('hotboard')
const currentHotboardType = ref('weibo')

// 切换 Tab
const switchTab = (tab: 'links' | 'hotboard') => {
  activeTab.value = tab
}

// 处理搜索
const handleSearch = (query?: string) => {
  const searchText = query || searchQuery.value
  if (!searchText.trim()) return
  
  // 添加到历史记录
  addToHistory(searchText)
  
  const engine = searchEngines.find(e => e.value === selectedEngine.value)
  if (engine) {
    window.open(engine.url + encodeURIComponent(searchText), '_blank')
  }
  
  // 隐藏建议列表
  showSuggestions.value = false
  selectedSuggestionIndex.value = -1
}

// 处理建议项点击
const handleSuggestionClick = (suggestion: any) => {
  if (suggestion.type === 'link' && suggestion.url) {
    // 如果是链接建议，先打开链接
    window.open(suggestion.url, '_blank')
    // 异步记录点击，使用节流
    const link = links.value.find(l => l.url === suggestion.url)
    if (link?.id) {
      throttledRecordClick(link.id)
    }
  } else {
    // 其他建议，执行搜索
    searchQuery.value = suggestion.text
    handleSearch(suggestion.text)
  }
  showSuggestions.value = false
}

// 从历史中移除
const handleRemoveHistory = (text: string, event: Event) => {
  event.stopPropagation()
  removeFromHistory(text)
}

// 键盘导航
const handleKeyDown = (event: KeyboardEvent) => {
  if (!showSuggestions.value || suggestions.value.length === 0) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedSuggestionIndex.value = Math.min(
        selectedSuggestionIndex.value + 1,
        suggestions.value.length - 1
      )
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedSuggestionIndex.value = Math.max(selectedSuggestionIndex.value - 1, -1)
      break
    case 'Enter':
      event.preventDefault()
      if (selectedSuggestionIndex.value >= 0) {
        handleSuggestionClick(suggestions.value[selectedSuggestionIndex.value])
      } else {
        handleSearch()
      }
      break
    case 'Escape':
      showSuggestions.value = false
      selectedSuggestionIndex.value = -1
      break
  }
}

// 输入框聚焦
const handleInputFocus = () => {
  showSuggestions.value = true
  selectedSuggestionIndex.value = -1
}

// 输入变化
const handleInputChange = () => {
  showSuggestions.value = true
  selectedSuggestionIndex.value = -1
  // 获取搜索引擎建议
  debouncedFetchSuggestions(searchQuery.value)
}

// 切换搜索引擎时重新获取建议
watch(selectedEngine, () => {
  if (searchQuery.value.trim()) {
    debouncedFetchSuggestions(searchQuery.value)
  }
})

// 点击外部关闭建议
const searchContainerRef = ref<HTMLElement | null>(null)
onMounted(() => {
  if (process.client) {
    document.addEventListener('click', (e) => {
      if (searchContainerRef.value && !searchContainerRef.value.contains(e.target as Node)) {
        showSuggestions.value = false
      }
    })
  }
})

// 清理定时器
onUnmounted(() => {
  if (fetchTimer) {
    clearTimeout(fetchTimer)
  }
})

// 节流记录点击（用于搜索建议中的链接点击）
const throttledRecordClick = useThrottleFn((linkId: number) => {
  recordClick(linkId)
}, 1000)

// 悬浮菜单状态
const showFloatingMenu = ref(false)

// 处理登出
const handleLogout = () => {
  showFloatingMenu.value = false
  logout()
  toast.add({
    title: '已退出登录',
    description: '期待您的再次访问',
    color: 'info',
  })
  // 不跳转，留在首页
}


// 客户端初始化：加载数据并根据登录状态切换 Tab
onMounted(() => {
  // 如果已登录，切换到我的链接并加载数据
  if (isLoggedIn.value) {
    activeTab.value = 'links'
    fetchLinks({ all: true })  // 首页获取全部数据，用于搜索建议
  }
  // 加载公开链接推荐（所有用户都可以看）
  fetchPublicLinks({ sort: 'popular', limit: 12 })
})

// 监听登录状态变化
watch(isLoggedIn, (newVal) => {
  if (newVal) {
    fetchLinks({ all: true })  // 首页获取全部数据
  }
})

// 公开链接推荐的排序
const publicSortBy = ref<'popular' | 'recent'>('popular')

// 切换排序方式
const handlePublicSortChange = (sort: 'popular' | 'recent') => {
  publicSortBy.value = sort
  fetchPublicLinks({ sort, limit: 12 })
}

// 处理公开链接点击
const handlePublicLinkClick = (link: any) => {
  window.open(link.url, '_blank')
}
</script>

<style scoped>
/* Logo 动画 */
@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.05);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}
</style>

<template>
  <div 
    class="min-h-screen relative"
    :class="{ 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800': !homeBackground && !useBingWallpaper }"
  >
    <!-- 必应壁纸背景层 -->
    <div 
      v-if="useBingWallpaper" 
      class="fixed inset-0 z-0"
      :style="{ backgroundImage: `url(${bingWallpaperUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }"
    >
      <!-- 半透明遮罩层，使用用户配置的透明度和模糊度 -->
      <div 
        class="absolute inset-0 bg-white dark:bg-gray-900"
        :style="{
          opacity: backgroundOpacity / 100,
          backdropFilter: `blur(${backgroundBlur}px)`,
          WebkitBackdropFilter: `blur(${backgroundBlur}px)`
        }"
      ></div>
    </div>

    <!-- 自定义背景层 -->
    <div 
      v-else-if="homeBackground" 
      class="fixed inset-0 z-0"
      :style="{ backgroundImage: `url(${homeBackground})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }"
    >
      <!-- 半透明遮罩层，使用用户配置的透明度和模糊度 -->
      <div 
        class="absolute inset-0 bg-white dark:bg-gray-900"
        :style="{
          opacity: backgroundOpacity / 100,
          backdropFilter: `blur(${backgroundBlur}px)`,
          WebkitBackdropFilter: `blur(${backgroundBlur}px)`
        }"
      ></div>
    </div>

    <!-- 主要内容区域 -->
    <main class="container mx-auto px-4 py-8 animate-fade-in">
      <!-- 搜索区域 -->
      <div class="max-w-4xl mx-auto mb-16 animate-fade-in-down">
        <!-- 搜索框 -->
        <div ref="searchContainerRef" class="bg-white dark:bg-primary-800/50 rounded-2xl shadow-xl p-8 border-2 dark:border-primary-700 relative backdrop-blur-sm hover-lift z-50">
          <form @submit.prevent="handleSearch()" class="space-y-4">
            <!-- 搜索引擎选择 -->
            <div class="flex flex-wrap items-center justify-center gap-2 mb-4 animate-fade-in animate-delay-100">
              <UButton
                v-for="engine in searchEngines"
                :key="engine.value"
                :variant="selectedEngine === engine.value ? 'solid' : 'outline'"
                :color="selectedEngine === engine.value ? 'primary' : 'neutral'"
                size="sm"
                @click="selectedEngine = engine.value"
                class="transition-all duration-300 hover:scale-105"
              >
                <span class="flex items-center gap-2">
                  <UIcon :name="engine.icon" />
                  {{ engine.label }}
                </span>
              </UButton>
            </div>

            <!-- 搜索输入框 -->
            <div class="relative animate-fade-in animate-delay-200">
              <div class="flex gap-2">
                <UInput
                  v-model="searchQuery"
                  size="xl"
                  placeholder="输入搜索内容，支持历史记录和链接匹配..."
                  class="flex-1 transition-all duration-300 focus:scale-[1.02]"
                  icon="i-mdi-magnify"
                  @focus="handleInputFocus"
                  @input="handleInputChange"
                  @keydown="handleKeyDown"
                />
                <UButton
                  type="submit"
                  size="xl"
                  class="btn-accent px-8 font-bold text-lg transition-all duration-300 hover:scale-105 hover-glow"
                  :disabled="!searchQuery.trim()"
                >
                  <span class="flex items-center gap-2">
                    <UIcon name="i-mdi-magnify" class="text-2xl" />
                    <span>搜索</span>
                  </span>
                </UButton>
              </div>

              <!-- 搜索建议下拉列表 -->
              <div
                v-if="showSuggestions && suggestions.length > 0"
                class="absolute top-full left-0 right-14 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-[100] max-h-96 overflow-y-auto"
              >
                <!-- 建议列表 -->
                <div class="py-2">
                  <div
                    v-for="(suggestion, index) in suggestions"
                    :key="`${suggestion.type}-${suggestion.text}-${index}`"
                    class="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors flex items-center justify-between gap-3"
                    :class="{
                      'bg-gray-100 dark:bg-gray-700': index === selectedSuggestionIndex
                    }"
                    @click="handleSuggestionClick(suggestion)"
                  >
                    <div class="flex items-center gap-3 flex-1 min-w-0">
                      <!-- 图标 -->
                      <div class="flex-shrink-0">
                        <img
                          v-if="suggestion.type === 'link' && suggestion.icon && !suggestion.icon.startsWith('i-')"
                          :src="suggestion.icon"
                          class="w-6 h-6 rounded"
                          @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
                        />
                        <UIcon
                          v-else
                          :name="suggestion.icon || 'i-mdi-magnify'"
                          class="text-xl"
                          :class="{
                            'text-gray-500': suggestion.type === 'history',
                            'text-blue-500': suggestion.type === 'link',
                            'text-primary': suggestion.type === 'suggestion',
                          }"
                        />
                      </div>

                      <!-- 文本内容 -->
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                          <span class="text-sm font-medium truncate">{{ suggestion.text }}</span>
                          <UBadge
                            v-if="suggestion.type === 'link'"
                            size="xs"
                            color="info"
                            variant="subtle"
                          >
                            链接
                          </UBadge>
                          <UBadge
                            v-else-if="suggestion.type === 'history'"
                            size="xs"
                            color="neutral"
                            variant="subtle"
                          >
                            历史
                          </UBadge>
                          <UBadge
                            v-else-if="suggestion.type === 'engine'"
                            size="xs"
                            color="primary"
                            variant="subtle"
                          >
                            {{ searchEngines.find(e => e.value === selectedEngine)?.label }}
                          </UBadge>
                        </div>
                        <p v-if="suggestion.category" class="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {{ suggestion.category }}
                        </p>
                      </div>

                      <!-- 操作按钮 -->
                      <div class="flex-shrink-0">
                        <UButton
                          v-if="suggestion.type === 'history'"
                          size="xs"
                          color="neutral"
                          variant="ghost"
                          icon="i-mdi-close"
                          @click="handleRemoveHistory(suggestion.text, $event)"
                        />
                        <UIcon
                          v-else-if="suggestion.type === 'link'"
                          name="i-mdi-open-in-new"
                          class="text-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 底部操作栏 -->
                <div v-if="searchHistory.length > 0" class="border-t border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    共 {{ searchHistory.length }} 条历史记录
                  </span>
                  <UButton
                    size="xs"
                    color="neutral"
                    variant="ghost"
                    @click="clearHistory(); showSuggestions = false"
                  >
                    清除历史
                  </UButton>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- 已登录用户：Tab 切换显示内容 -->
      <div v-if="isLoggedIn" class="max-w-7xl mx-auto relative z-10 animate-fade-in-up animate-delay-300">
        <!-- Tab 导航 -->
        <div class="flex items-center gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            class="px-4 py-3 font-medium transition-colors relative"
            :class="activeTab === 'links' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'"
            @click="switchTab('links')"
          >
            <div class="flex items-center gap-2">
              <UIcon name="i-mdi-link-variant" class="text-xl" />
              <span>我的链接</span>
              <UBadge size="xs" color="neutral" variant="subtle">{{ links.length }}</UBadge>
            </div>
          </button>

          <button
            class="px-4 py-3 font-medium transition-colors relative"
            :class="activeTab === 'hotboard' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'"
            @click="switchTab('hotboard')"
          >
            <div class="flex items-center gap-2">
              <UIcon name="i-mdi-fire" class="text-xl" />
              <span>热点榜</span>
            </div>
          </button>
        </div>
        <!-- Tab 内容 -->
        <div>
          <!-- 我的链接 Tab -->
          <div v-if="activeTab === 'links'">
            <MyLinksList />
          </div>

          <!-- 热点榜 Tab -->
          <div v-if="activeTab === 'hotboard'">
            <HotboardList :default-platform="currentHotboardType" />
          </div>
        </div>
      </div>

      <!-- 未登录用户：显示功能介绍 -->
      <div v-else>
        <!-- Hero Section -->
        <div class="text-center max-w-3xl mx-auto mb-16">
          <h2 class="text-5xl font-bold mb-6">
            个人网页导航
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-400 mb-8">
            收藏和管理您最喜欢的网站链接,打造专属的个人导航页面
          </p>
          
          <!-- CTA 按钮 -->
          <div class="flex items-center justify-center gap-4">
            <UButton
              to="/register"
              size="xl"
              color="primary"
              icon="i-mdi-rocket-launch"
            >
              立即开始
            </UButton>
            <UButton
              to="/login"
              size="xl"
              variant="ghost"
              icon="i-mdi-login"
            >
              登录账户
            </UButton>
          </div>
        </div>

      </div>

      <!-- 网页推荐部分（所有用户都可见） -->
      <div class="max-w-7xl mx-auto mt-16">
        <!-- 添加背景容器以提高可读性 -->
        <div class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
        <!-- 标题和控制栏 -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 class="text-2xl font-bold mb-1 flex items-center gap-2">
              <UIcon name="i-mdi-star-circle" class="text-yellow-500" />
              网页推荐
            </h2>
            <p class="text-gray-600 dark:text-gray-400">
              发现其他用户分享的优质链接
            </p>
          </div>

          <!-- 排序和筛选 -->
          <div class="flex flex-wrap items-center gap-2">
          <!-- 排序方式 -->
          <div class="flex items-center gap-2">
            <UButton
              size="sm"
              :variant="publicSortBy === 'popular' ? 'solid' : 'outline'"
              :color="publicSortBy === 'popular' ? 'primary' : 'neutral'"
              icon="i-mdi-fire"
              @click="handlePublicSortChange('popular')"
            >
              热门
            </UButton>
            <UButton
              size="sm"
              :variant="publicSortBy === 'recent' ? 'solid' : 'outline'"
              :color="publicSortBy === 'recent' ? 'primary' : 'neutral'"
              icon="i-mdi-clock"
              @click="handlePublicSortChange('recent')"
            >
              最新
            </UButton>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loadingPublic" class="text-center py-12">
        <UIcon name="i-mdi-loading" class="animate-spin text-4xl text-primary" />
        <p class="mt-4 text-gray-600 dark:text-gray-400">加载推荐中...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="publicLinks.length === 0" class="text-center py-12">
        <div class="inline-block p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
          <UIcon name="i-mdi-web-off" class="text-5xl text-gray-400" />
        </div>
          <h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">暂无公开推荐</h3>
        <p class="text-gray-600 dark:text-gray-400">
          还没有用户分享链接，成为第一个分享者吧！
        </p>
      </div>

      <!-- 推荐链接网格 -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <UCard
          v-for="link in publicLinks"
          :key="link.id"
          class="hover:shadow-lg transition-all duration-300 cursor-pointer group"
          @click="handlePublicLinkClick(link)"
        >
            <div class="flex flex-col h-full">
              <!-- 图标和标题 -->
              <div class="flex items-start gap-3 mb-3">
                <div class="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <img
                    v-if="link.icon"
                    :src="link.icon"
                    :alt="link.title"
                    class="w-8 h-8 rounded"
                    @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
                  />
                  <UIcon v-else name="i-mdi-web" class="text-2xl text-green-600 dark:text-green-400" />
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
                    {{ link.title }}
                  </h3>
                  <p v-if="link.category" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {{ link.category }}
                  </p>
                </div>
              </div>

              <!-- 描述 -->
              <p v-if="link.description" class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 flex-1">
                {{ link.description }}
              </p>

              <!-- 底部信息 -->
              <div class="flex flex-col gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                <!-- 分享者信息 -->
                <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <UIcon name="i-mdi-account-circle" />
                  <span class="truncate">
                    {{ link.sharedBy.name }}
                  </span>
                </div>
                <!-- 统计信息 -->
                <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span class="flex items-center gap-1">
                    <UIcon name="i-mdi-chart-line" />
                    {{ link.clicks }} 次点击
                  </span>
                  <span class="flex items-center gap-1">
                    <UIcon name="i-mdi-earth" />
                    公开分享
                  </span>
                </div>
              </div>
            </div>
          </UCard>
        </div>
        </div>
        <!-- 背景容器结束 -->
      </div>
    </main>

    <!-- 底部 -->
    <footer class="border-t border-gray-200 dark:border-gray-800 mt-16">
      <div class="container mx-auto px-4 py-8">
        <div class="text-center text-gray-600 dark:text-gray-400">
          <a class="mt-2 text-sm" href="https://github.com/wkif/LinkLantern" target="_blank">
            LinkLantern © {{ new Date().getFullYear() }}
          </a>
        </div>
    </div>
    </footer>

    <!-- 右下角悬浮菜单 -->
    <div class="fixed bottom-8 right-8 z-50">
      <!-- 未登录状态 -->
      <template v-if="!isLoggedIn">
        <div class="flex flex-col gap-3 animate-scale-in">
          <!-- 深色模式切换按钮 -->
          <ColorModeToggle />
          
          <UButton
            to="/register"
            class="btn-accent shadow-2xl transition-all duration-300 hover:scale-105 hover-glow"
            size="xl"
            icon="i-mdi-account-plus"
          >
            注册
          </UButton>
          <UButton
            to="/login"
            color="primary"
            variant="solid"
            size="lg"
            icon="i-mdi-login"
            class="shadow-xl transition-all duration-300 hover:scale-105"
          >
            登录
          </UButton>
        </div>
      </template>

      <!-- 已登录状态 - 悬浮菜单 -->
      <template v-else>
        <div class="relative flex items-center justify-center">
          <!-- 主菜单按钮 -->
          <UButton
            @click="showFloatingMenu = !showFloatingMenu"
            class="w-16 h-16 rounded-full shadow-2xl gradient-bg hover:scale-110 transition-all duration-300 flex items-center justify-center p-0 animate-breathe"
            :class="{ 'ring-4 ring-accent-400 animate-glow': showFloatingMenu }"
          >
            <UAvatar
              :src="user?.avatar"
              :alt="user?.name || user?.email"
              size="md"
              class="flex items-center justify-center bg-58495A"
            >
              <template v-if="!user?.avatar">
                <span class="text-white font-bold text-xl">
                  {{ (user?.name || user?.email || 'U').charAt(0).toUpperCase() }}
                </span>
              </template>
            </UAvatar>
          </UButton>

          <!-- 展开的菜单项 -->
          <transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-4"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-4"
          >
            <div
              v-if="showFloatingMenu"
              class="absolute bottom-20 right-0 flex flex-col gap-2 min-w-[200px]"
            >
              <!-- 用户信息卡片 -->
              <UCard class="bg-white/95 dark:bg-primary-800/95 backdrop-blur-md shadow-xl border-2 dark:border-primary-700">
                <div class="text-center pb-3 border-b border-primary-200 dark:border-primary-700">
                  <p class="font-semibold text-primary-700 dark:text-primary-300 truncate">
                    {{ user?.name || '未设置用户名' }}
                  </p>
                  <p class="text-xs text-secondary-600 dark:text-secondary-400 truncate">
                    {{ user?.email }}
                  </p>
                </div>

                <div class="space-y-2 mt-3">
                  <UButton
                    to="/admin"
                    variant="soft"
                    color="primary"
                    block
                    icon="i-mdi-view-dashboard"
                    @click="showFloatingMenu = false"
                    class="transition-all duration-200 hover:scale-[1.02]"
                  >
                    管理后台
                  </UButton>
                  
                  <UButton
                    to="/admin/links"
                    variant="soft"
                    color="primary"
                    block
                    icon="i-mdi-link-variant"
                    @click="showFloatingMenu = false"
                    class="transition-all duration-200 hover:scale-[1.02]"
                  >
                    我的链接
                  </UButton>

                  <UButton
                    to="/admin/profile"
                    variant="soft"
                    color="primary"
                    block
                    icon="i-mdi-account"
                    @click="showFloatingMenu = false"
                    class="transition-all duration-200 hover:scale-[1.02]"
                  >
                    个人信息
                  </UButton>

                  <UDivider />

                  <!-- 深色模式切换 -->
                  <div class="flex items-center justify-between px-3 py-2">
                    <ColorModeToggle />
                  </div>

                  <UDivider />

                  <UButton
                    variant="soft"
                    color="error"
                    block
                    icon="i-mdi-logout"
                    @click="handleLogout"
                    class="transition-all duration-200 hover:scale-[1.02]"
                  >
                    退出登录
                  </UButton>
                </div>
              </UCard>
            </div>
          </transition>
        </div>
      </template>
    </div>

    <!-- 点击外部关闭悬浮菜单 -->
    <div
      v-if="showFloatingMenu"
      class="fixed inset-0 z-40"
      @click="showFloatingMenu = false"
    ></div>
  </div>
</template>

<style scoped>
/* 自定义样式 */
</style>

