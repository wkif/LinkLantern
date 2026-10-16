<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'admin',
})

const toast = useToast()
const {
  blockedKeywords,
  fetchBlockedKeywords,
  saveBlockedKeywords,
} = useHotboard()

const MAX_KEYWORD_LENGTH = 50

// 新增关键词
const newKeywordInput = ref('')
const keywordSaving = ref(false)

// 编辑中的关键词（值为原关键词；空字符串表示未在编辑）
const editingKeyword = ref<string | null>(null)
const editingValue = ref('')

/**
 * 添加新关键词
 */
const addKeyword = async () => {
  const keyword = newKeywordInput.value.trim()
  if (!keyword) return

  if (blockedKeywords.value.includes(keyword)) {
    toast.add({
      title: '关键词已存在',
      description: `「${keyword}」已在屏蔽列表中`,
      color: 'warning',
      icon: 'i-mdi-alert',
    })
    return
  }

  keywordSaving.value = true
  try {
    const result = await saveBlockedKeywords([...blockedKeywords.value, keyword])
    if (result.success) {
      newKeywordInput.value = ''
      toast.add({
        title: '已添加',
        description: `关键词「${keyword}」已生效`,
        color: 'success',
        icon: 'i-mdi-check-circle',
      })
    } else {
      toast.add({
        title: '添加失败',
        description: result.message || '请稍后重试',
        color: 'error',
        icon: 'i-mdi-alert-circle',
      })
    }
  } finally {
    keywordSaving.value = false
  }
}

/**
 * 删除关键词
 */
const removeKeyword = async (keyword: string) => {
  keywordSaving.value = true
  try {
    const result = await saveBlockedKeywords(blockedKeywords.value.filter(k => k !== keyword))
    if (result.success) {
      toast.add({
        title: '已移除',
        description: `关键词「${keyword}」不再屏蔽`,
        color: 'success',
        icon: 'i-mdi-check-circle',
      })
    } else {
      toast.add({
        title: '移除失败',
        description: result.message || '请稍后重试',
        color: 'error',
        icon: 'i-mdi-alert-circle',
      })
    }
  } finally {
    keywordSaving.value = false
  }
}

/**
 * 进入编辑状态
 */
const startEditKeyword = (keyword: string) => {
  editingKeyword.value = keyword
  editingValue.value = keyword
}

/**
 * 取消编辑
 */
const cancelEditKeyword = () => {
  editingKeyword.value = null
  editingValue.value = ''
}

/**
 * 保存编辑（重命名关键词）
 */
const confirmEditKeyword = async () => {
  const oldKeyword = editingKeyword.value
  const newKeyword = editingValue.value.trim()
  if (!oldKeyword) return

  if (!newKeyword) {
    toast.add({
      title: '关键词不能为空',
      color: 'warning',
      icon: 'i-mdi-alert',
    })
    return
  }

  if (newKeyword === oldKeyword) {
    cancelEditKeyword()
    return
  }

  if (blockedKeywords.value.includes(newKeyword)) {
    toast.add({
      title: '关键词已存在',
      description: `「${newKeyword}」已在屏蔽列表中`,
      color: 'warning',
      icon: 'i-mdi-alert',
    })
    return
  }

  keywordSaving.value = true
  try {
    const next = blockedKeywords.value.map(k => (k === oldKeyword ? newKeyword : k))
    const result = await saveBlockedKeywords(next)
    if (result.success) {
      cancelEditKeyword()
      toast.add({
        title: '已更新',
        description: `「${oldKeyword}」→「${newKeyword}」`,
        color: 'success',
        icon: 'i-mdi-check-circle',
      })
    } else {
      toast.add({
        title: '更新失败',
        description: result.message || '请稍后重试',
        color: 'error',
        icon: 'i-mdi-alert-circle',
      })
    }
  } finally {
    keywordSaving.value = false
  }
}

onMounted(() => {
  fetchBlockedKeywords()
})
</script>

<template>
  <div>
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold mb-2">关键词屏蔽</h1>
      <p class="text-gray-600 dark:text-gray-400">
        热点榜中标题包含这些关键词的条目将显示为「已屏蔽相关信息」
      </p>
    </div>

    <UCard class="max-w-2xl">
      <div class="space-y-4">
        <!-- 新增关键词 -->
        <form class="flex flex-wrap items-center gap-2" @submit.prevent="addKeyword">
          <UInput
            v-model="newKeywordInput"
            placeholder="输入关键词，如：明星八卦"
            :maxlength="MAX_KEYWORD_LENGTH"
            class="flex-1 min-w-48"
          />
          <UButton
            type="submit"
            color="primary"
            icon="i-mdi-plus"
            :loading="keywordSaving"
            :disabled="!newKeywordInput.trim() || keywordSaving"
          >
            添加
          </UButton>
        </form>

        <!-- 关键词列表 -->
        <div v-if="blockedKeywords.length === 0" class="text-sm text-gray-500 dark:text-gray-400 py-2">
          暂无屏蔽关键词。
        </div>
        <ul v-else class="space-y-2">
          <li
            v-for="keyword in blockedKeywords"
            :key="keyword"
            class="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <template v-if="editingKeyword === keyword">
              <UInput
                v-model="editingValue"
                :maxlength="MAX_KEYWORD_LENGTH"
                class="flex-1 min-w-0"
                @keyup.enter="confirmEditKeyword"
                @keyup.escape="cancelEditKeyword"
              />
              <UButton
                size="xs"
                color="primary"
                icon="i-mdi-check"
                :loading="keywordSaving"
                :disabled="!editingValue.trim()"
                aria-label="保存编辑"
                @click="confirmEditKeyword"
              />
              <UButton
                size="xs"
                color="neutral"
                variant="ghost"
                icon="i-mdi-close"
                aria-label="取消编辑"
                @click="cancelEditKeyword"
              />
            </template>
            <template v-else>
              <UBadge color="neutral" variant="soft" class="font-normal break-all">
                {{ keyword }}
              </UBadge>
              <span class="flex-1"></span>
              <UButton
                size="xs"
                color="neutral"
                variant="ghost"
                icon="i-mdi-pencil"
                :disabled="keywordSaving"
                aria-label="编辑关键词"
                @click="startEditKeyword(keyword)"
              />
              <UButton
                size="xs"
                color="error"
                variant="ghost"
                icon="i-mdi-delete-outline"
                :disabled="keywordSaving"
                aria-label="删除关键词"
                @click="removeKeyword(keyword)"
              />
            </template>
          </li>
        </ul>

        <p class="text-xs text-gray-500 dark:text-gray-400">
          修改立即生效，首页热点榜会同步应用。
        </p>
      </div>
    </UCard>
  </div>
</template>
