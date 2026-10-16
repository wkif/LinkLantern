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
        <UButton size="sm" @click="handleRefresh">
          <template #leading>
            <UIcon name="i-mdi-refresh" />
          </template>
          刷新
        </UButton>
      </div>

      <!-- 热榜列表 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
          v-for="(item, index) in displayList"
          :key="index"
          class="group relative flex items-start gap-3 p-4 rounded-xl border transition-all duration-200"
          :class="item.blockedBy
            ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 cursor-default'
            : 'border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-md'"
        >
          <!-- 非屏蔽条目：整卡为链接 -->
          <a
            v-if="!item.blockedBy"
            class="absolute inset-0 z-0"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="item.title"
          ></a>

          <!-- 排名徽章（主题色） -->
          <div
            class="relative z-10 flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg font-bold text-sm shadow-sm"
            :class="{
              'bg-gradient-to-br from-primary-500 to-primary-600 text-white': index < 3,
              'bg-gradient-to-br from-secondary-400 to-secondary-500 text-white': index >= 3 && index < 10,
              'bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-300': index >= 10
            }"
          >
            {{ index + 1 }}
          </div>

          <!-- 内容区域 -->
          <div class="relative z-10 flex-1 min-w-0">
            <h4
              class="text-sm font-medium line-clamp-2 leading-snug mb-2 transition-colors"
              :class="item.blockedBy
                ? 'text-gray-400 dark:text-gray-500 italic'
                : 'text-gray-900 dark:text-gray-100 group-hover:text-primary'"
            >
              {{ item.blockedBy ? BLOCKED_PLACEHOLDER : item.title }}
            </h4>
            <div v-if="item.hot && !item.blockedBy" class="flex items-center gap-1 text-xs">
              <UIcon name="i-mdi-fire" class="text-red-500" />
              <span class="text-red-500 font-medium">{{ item.hot }}</span>
            </div>
          </div>

          <!-- 屏蔽按钮（悬停出现） -->
          <UButton
            class="relative z-10 flex-shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity mt-0.5"
            size="xs"
            color="neutral"
            variant="ghost"
            icon="i-mdi-cancel"
            :aria-label="`屏蔽「${item.blockedBy ? BLOCKED_PLACEHOLDER : item.title}」`"
            title="屏蔽"
            @click.stop.prevent="openBlockModal(item)"
          />
        </div>
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

    <!-- 新增屏蔽关键词弹窗 -->
    <UModal v-model:open="showBlockModal" title="新增屏蔽关键词">
      <template #body>
        <form class="space-y-4" @submit.prevent="confirmBlock">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            将屏蔽标题包含该关键词的热榜条目，显示为「{{ BLOCKED_PLACEHOLDER }}」。
          </p>
          <UFormField label="关键词" :hint="`最多 ${MAX_KEYWORD_LENGTH} 个字符`">
            <UInput
              v-model="blockKeywordInput"
              class="w-full"
              placeholder="输入要屏蔽的关键词"
              maxlength="50"
              autofocus
            />
          </UFormField>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" type="button" @click="showBlockModal = false">
              取消
            </UButton>
            <UButton color="primary" type="submit" :loading="blockSaving" :disabled="!blockKeywordInput.trim()">
              屏蔽
            </UButton>
          </div>
        </form>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const {
  activePlatforms,
  hotboardCache,
  loading,
  blockedKeywords,
  fetchBlockedKeywords,
  saveBlockedKeywords,
  maskItems,
  fetchHotboard,
  getPlatformInfo,
} = useHotboard()

const MAX_KEYWORD_LENGTH = 50

// Props
interface Props {
  defaultPlatform?: string
}

const props = withDefaults(defineProps<Props>(), {
  defaultPlatform: 'weibo'
})

const toast = useToast()

// 当前选择的平台
const currentType = ref(props.defaultPlatform)

// 当前平台的数据
const currentData = computed(() => {
  return hotboardCache.value[currentType.value]?.data || null
})

// 应用屏蔽关键词后的展示列表
const displayList = computed(() => {
  if (!currentData.value) return []
  return maskItems(currentData.value.list.slice(0, 30))
})

// 屏蔽弹窗状态
const showBlockModal = ref(false)
const blockKeywordInput = ref('')
const blockSaving = ref(false)

/**
 * 打开屏蔽弹窗：普通条目预填标题，已屏蔽条目预填命中的关键词（可编辑）
 */
const openBlockModal = (item: MaskedHotboardItem) => {
  blockKeywordInput.value = item.blockedBy ?? item.title
  showBlockModal.value = true
}

/**
 * 确认新增屏蔽关键词：合并去重后整体保存
 */
const confirmBlock = async () => {
  const keyword = blockKeywordInput.value.trim()
  if (!keyword) return

  blockSaving.value = true
  try {
    const alreadyHad = blockedKeywords.value.includes(keyword)
    const next = alreadyHad ? blockedKeywords.value : [...blockedKeywords.value, keyword]
    const result = await saveBlockedKeywords(next)

    if (result.success) {
      showBlockModal.value = false
      blockKeywordInput.value = ''
      toast.add({
        title: '已屏蔽',
        description: `关键词「${keyword}」${alreadyHad ? '已存在并生效' : '已生效'}`,
        color: 'success',
        icon: 'i-mdi-check-circle',
      })
    } else {
      toast.add({
        title: '屏蔽失败',
        description: result.message || '请稍后重试',
        color: 'error',
        icon: 'i-mdi-alert-circle',
      })
    }
  } finally {
    blockSaving.value = false
  }
}

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

// 初始化：加载屏蔽关键词与默认平台数据
onMounted(async () => {
  await fetchBlockedKeywords()
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

