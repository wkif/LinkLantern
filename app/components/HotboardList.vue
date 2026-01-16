<template>
  <div class="hotboard-container">
    <!-- 平台选择 -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">选择平台</h3>
        <span class="text-xs text-gray-500">{{ activePlatforms.length }} 个平台</span>
      </div>
      <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <UButton
          v-for="platform in activePlatforms"
          :key="platform"
          size="sm"
          :variant="currentType === platform ? 'solid' : 'ghost'"
          :color="currentType === platform ? 'primary' : 'neutral'"
          class="whitespace-nowrap flex-shrink-0"
          @click="handleSwitchPlatform(platform)"
        >
          <template #leading>
            <UIcon :name="getPlatformInfo(platform)?.icon || 'i-mdi-web'" />
          </template>
          {{ getPlatformInfo(platform)?.name || platform }}
        </UButton>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-if="loading[currentType]" class="flex items-center justify-center py-20">
      <div class="text-center">
        <UIcon name="i-mdi-loading" class="animate-spin text-5xl text-primary mb-4" />
        <p class="text-gray-500">加载中...</p>
      </div>
    </div>

    <!-- 热榜数据 -->
    <div v-else-if="currentData" class="space-y-4">
      <!-- 顶部信息栏 -->
      <div class="flex items-center justify-between px-2">
        <div class="flex items-center gap-3">
          <UIcon :name="getPlatformInfo(currentType)?.icon || 'i-mdi-fire'" class="text-2xl text-primary" />
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-gray-100">
              {{ getPlatformInfo(currentType)?.name || currentType }}
            </h3>
            <p class="text-xs text-gray-500">
              更新时间：{{ currentData.update_time }}
            </p>
          </div>
        </div>
        <UButton size="sm" variant="ghost" @click="handleRefresh">
          <template #leading>
            <UIcon name="i-mdi-refresh" />
          </template>
          刷新
        </UButton>
      </div>

      <!-- 热榜列表 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <a
          v-for="(item, index) in currentData.list.slice(0, 30)"
          :key="index"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
          class="group flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-md transition-all duration-200"
        >
          <!-- 排名徽章 -->
          <div 
            class="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg font-bold text-sm shadow-sm"
            :class="{
              'bg-gradient-to-br from-red-500 to-red-600 text-white': index < 3,
              'bg-gradient-to-br from-orange-400 to-orange-500 text-white': index >= 3 && index < 10,
              'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300': index >= 10
            }"
          >
            {{ index + 1 }}
          </div>

          <!-- 内容区域 -->
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary line-clamp-2 leading-snug mb-2 transition-colors">
              {{ item.title }}
            </h4>
            <div v-if="item.hot" class="flex items-center gap-1 text-xs">
              <UIcon name="i-mdi-fire" class="text-red-500" />
              <span class="text-red-500 font-medium">{{ item.hot }}</span>
            </div>
          </div>

          <!-- 箭头图标 -->
          <UIcon 
            name="i-mdi-open-in-new" 
            class="flex-shrink-0 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1"
          />
        </a>
      </div>
    </div>

    <!-- 加载失败 -->
    <div v-else class="flex flex-col items-center justify-center py-20 text-gray-500">
      <UIcon name="i-mdi-alert-circle-outline" class="text-6xl mb-4 text-gray-400" />
      <p class="text-lg mb-2">暂无数据</p>
      <p class="text-sm text-gray-400 mb-4">该平台数据暂时无法获取</p>
      <UButton 
        size="sm" 
        variant="outline" 
        @click="handleRefresh"
      >
        <template #leading>
          <UIcon name="i-mdi-refresh" />
        </template>
        重试
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const { 
  activePlatforms, 
  hotboardCache, 
  loading, 
  fetchHotboard, 
  getPlatformInfo 
} = useHotboard()

// Props
interface Props {
  defaultPlatform?: string
}

const props = withDefaults(defineProps<Props>(), {
  defaultPlatform: 'weibo'
})

// 当前选择的平台
const currentType = ref(props.defaultPlatform)

// 当前平台的数据
const currentData = computed(() => {
  return hotboardCache.value[currentType.value]?.data || null
})

// 切换平台
const handleSwitchPlatform = async (type: string) => {
  currentType.value = type
  // 如果没有缓存数据，则加载
  if (!hotboardCache.value[type]) {
    await fetchHotboard(type)
  }
}

// 刷新当前平台
const handleRefresh = async () => {
  await fetchHotboard(currentType.value)
}

// 初始化：加载默认平台数据
onMounted(() => {
  if (!hotboardCache.value[currentType.value]) {
    fetchHotboard(currentType.value)
  }
})
</script>

<style scoped>
/* 隐藏滚动条但保持滚动功能 */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>

