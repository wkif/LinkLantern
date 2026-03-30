<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'admin',
})

const toast = useToast()
const { exportLinks: exportLinksAPI, importLinks: importLinksAPI } = useLinks()
const { accessToken } = useAuth()

const bookmarkHasToken = ref(false)
const bookmarkLoading = ref(false)
const showBookmarkTokenModal = ref(false)
const bookmarkTokenPlain = ref('')

const fetchBookmarkTokenStatus = async () => {
  if (!accessToken.value) return
  try {
    const res = await $fetch<{ success: boolean; data: { hasToken: boolean } }>(
      '/api/auth/bookmark-token',
      { headers: { Authorization: `Bearer ${accessToken.value}` } },
    )
    if (res.success) bookmarkHasToken.value = res.data.hasToken
  } catch {
    bookmarkHasToken.value = false
  }
}

watch(
  () => accessToken.value,
  (t) => {
    if (t) fetchBookmarkTokenStatus()
  },
  { immediate: true },
)

const createBookmarkToken = async () => {
  bookmarkLoading.value = true
  try {
    const res = await $fetch<{
      success: boolean
      data: { token: string }
      message?: string
    }>('/api/auth/bookmark-token', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken.value}` },
      body: {},
    })
    if (res.success && res.data?.token) {
      bookmarkTokenPlain.value = res.data.token
      showBookmarkTokenModal.value = true
      bookmarkHasToken.value = true
      toast.add({
        title: '令牌已生成',
        description: res.message || '请复制并保存到扩展选项中',
        color: 'success',
        icon: 'i-mdi-check-circle',
      })
    }
  } catch (error: any) {
    toast.add({
      title: '无法生成',
      description: error.data?.statusMessage || '若已有令牌，请使用「重新生成」',
      color: 'warning',
      icon: 'i-mdi-alert',
    })
  } finally {
    bookmarkLoading.value = false
  }
}

const rotateBookmarkToken = async () => {
  bookmarkLoading.value = true
  try {
    const res = await $fetch<{
      success: boolean
      data: { token: string }
      message?: string
    }>('/api/auth/bookmark-token', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken.value}` },
      body: { rotate: true },
    })
    if (res.success && res.data?.token) {
      bookmarkTokenPlain.value = res.data.token
      showBookmarkTokenModal.value = true
      bookmarkHasToken.value = true
      toast.add({
        title: '已轮换令牌',
        description: res.message || '旧令牌已失效',
        color: 'success',
        icon: 'i-mdi-check-circle',
      })
    }
  } catch (error: any) {
    toast.add({
      title: '操作失败',
      description: error.data?.statusMessage || '请稍后重试',
      color: 'error',
      icon: 'i-mdi-alert-circle',
    })
  } finally {
    bookmarkLoading.value = false
  }
}

const copyBookmarkToken = async () => {
  try {
    await navigator.clipboard.writeText(bookmarkTokenPlain.value)
    toast.add({ title: '已复制到剪贴板', color: 'success', icon: 'i-mdi-content-copy' })
  } catch {
    toast.add({ title: '复制失败', color: 'error', icon: 'i-mdi-alert-circle' })
  }
}

// 导入导出状态
const exporting = ref(false)
const importing = ref(false)
const importMode = ref<'append' | 'replace'>('append')
const fileInput = ref<HTMLInputElement | null>(null)

/**
 * 导出链接数据
 */
const handleExportLinks = async () => {
  exporting.value = true
  try {
    const result = await exportLinksAPI()
    
    if (result.success && result.data) {
      const data = result.data
      const jsonStr = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      // 创建下载链接
      const a = document.createElement('a')
      a.href = url
      a.download = `linklantern-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.add({
        title: '导出成功',
        description: `已导出 ${data.totalLinks} 个链接`,
        color: 'success',
        icon: 'i-mdi-check-circle',
      })
    } else {
      toast.add({
        title: '导出失败',
        description: result.message || '导出数据时发生错误',
        color: 'error',
        icon: 'i-mdi-alert-circle',
      })
    }
  } catch (error: any) {
    console.error('导出失败:', error)
    toast.add({
      title: '导出失败',
      description: error.message || '导出数据时发生错误',
      color: 'error',
      icon: 'i-mdi-alert-circle',
    })
  } finally {
    exporting.value = false
  }
}

/**
 * 触发文件选择
 */
const triggerImport = () => {
  fileInput.value?.click()
}

/**
 * 处理文件选择
 */
const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  // 验证文件类型
  if (!file.name.endsWith('.json')) {
    toast.add({
      title: '文件类型错误',
      description: '请选择 JSON 文件',
      color: 'error',
      icon: 'i-mdi-alert-circle',
    })
    return
  }
  
  importing.value = true
  
  try {
    // 读取文件内容
    const text = await file.text()
    const data = JSON.parse(text)
    
    // 验证数据格式
    if (!data.links || !Array.isArray(data.links)) {
      throw new Error('无效的数据格式：缺少 links 数组')
    }
    
    // 调用 composable 方法导入
    const result = await importLinksAPI({
      links: data.links,
      mode: importMode.value
    })
    
    if (result.success) {
      toast.add({
        title: '导入成功',
        description: result.message,
        color: 'success',
        icon: 'i-mdi-check-circle',
      })
    } else {
      toast.add({
        title: '导入失败',
        description: result.message || '导入数据时发生错误',
        color: 'error',
        icon: 'i-mdi-alert-circle',
      })
    }
  } catch (error: any) {
    console.error('导入失败:', error)
    toast.add({
      title: '导入失败',
      description: error.message || '导入数据时发生错误',
      color: 'error',
      icon: 'i-mdi-alert-circle',
    })
  } finally {
    importing.value = false
    // 清除文件选择
    if (target) target.value = ''
  }
}
</script>

<template>
  <div>
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold mb-2">关于</h1>
      <p class="text-gray-600 dark:text-gray-400">
        了解 LinkLantern
      </p>
    </div>

    <!-- 首页背景设置组件 -->
    <BackgroundSettings class="mb-6" />

    <!-- 浏览器快捷收藏 -->
    <UCard class="mb-6">
      <template #header>
        <h2 class="text-lg font-semibold flex items-center gap-2">
          <UIcon name="i-mdi-puzzle" />
          浏览器快捷收藏
        </h2>
      </template>

      <div class="space-y-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          安装 Chrome / Edge 扩展后，在任意网页按快捷键即可把当前页保存到 LinkLantern，无需再打开管理后台手动添加。
        </p>
        <div class="flex flex-wrap items-center gap-2">
          <a
            href="/extensions/linklantern-bookmark.zip"
            download="linklantern-bookmark.zip"
            class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100"
          >
            <UIcon name="i-mdi-download" class="shrink-0" />
            下载扩展（ZIP）
          </a>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            解压后，在浏览器中选择「加载已解压的扩展程序」并选中解压出的文件夹。
          </span>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          开发者也可直接使用仓库内目录
          <code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">extensions/linklantern-bookmark</code>
          。
        </p>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          状态：{{ bookmarkHasToken ? '已配置扩展令牌' : '尚未生成令牌' }} · 默认快捷键
          <kbd class="text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">Alt</kbd>
          +
          <kbd class="text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">Shift</kbd>
          +
          <kbd class="text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">Y</kbd>
          （可在浏览器的扩展快捷键设置里修改）。
        </p>
        <div class="flex flex-wrap gap-2">
          <UButton
            color="primary"
            icon="i-mdi-key-plus"
            :loading="bookmarkLoading"
            :disabled="bookmarkLoading || bookmarkHasToken"
            @click="createBookmarkToken"
          >
            生成扩展令牌
          </UButton>
          <UButton
            color="warning"
            variant="soft"
            icon="i-mdi-key-change"
            :loading="bookmarkLoading"
            :disabled="bookmarkLoading || !bookmarkHasToken"
            @click="rotateBookmarkToken"
          >
            重新生成令牌
          </UButton>
        </div>
        <p class="text-xs text-amber-700 dark:text-amber-300">
          令牌等同于账户钥匙，请勿泄露；重新生成后旧令牌立即失效，需在扩展选项里更新。
        </p>
      </div>
    </UCard>

    <UModal v-model:open="showBookmarkTokenModal" title="请立即保存扩展令牌">
      <template #body>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
          关闭此窗口后无法再次查看完整令牌。请复制并粘贴到扩展选项页的「扩展令牌」字段。
        </p>
        <pre
          class="text-xs p-3 rounded-lg bg-gray-100 dark:bg-gray-900 overflow-x-auto break-all font-mono"
        >{{ bookmarkTokenPlain }}</pre>
        <div class="flex justify-end gap-2 mt-4">
          <UButton variant="ghost" @click="showBookmarkTokenModal = false">关闭</UButton>
          <UButton color="primary" icon="i-mdi-content-copy" @click="copyBookmarkToken">
            复制令牌
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- 数据管理 -->
    <UCard class="mb-6">
      <template #header>
        <h2 class="text-lg font-semibold flex items-center gap-2">
          <UIcon name="i-mdi-database" />
          数据管理
        </h2>
      </template>

      <div class="space-y-6">
        <!-- 导出数据 -->
        <div>
          <h3 class="font-medium mb-2 flex items-center gap-2">
            <UIcon name="i-mdi-download" />
            导出数据
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
            将您的所有链接数据导出为 JSON 文件，方便备份和迁移。
          </p>
          <UButton 
            @click="handleExportLinks"
            :loading="exporting"
            :disabled="exporting"
            color="primary"
            icon="i-mdi-download"
          >
            导出链接数据
          </UButton>
        </div>

        <UDivider />

        <!-- 导入数据 -->
        <div>
          <h3 class="font-medium mb-2 flex items-center gap-2">
            <UIcon name="i-mdi-upload" />
            导入数据
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
            从 JSON 文件导入链接数据。支持追加模式和替换模式。
          </p>

          <!-- 导入模式选择 -->
          <div class="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p class="text-sm font-medium mb-2">导入模式：</p>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  v-model="importMode"
                  value="append"
                  class="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                />
                <span class="text-sm">追加模式（保留现有数据）</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  v-model="importMode"
                  value="replace"
                  class="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                />
                <span class="text-sm text-error-600 dark:text-error-400">替换模式（删除现有数据）</span>
              </label>
            </div>
          </div>

            <UButton 
              @click="triggerImport"
              :loading="importing"
              :disabled="importing"
              color="primary"
              icon="i-mdi-upload"
            >
            选择文件导入
            </UButton>

          <!-- 隐藏的文件输入 -->
          <input
            ref="fileInput"
            type="file"
            accept=".json"
            @change="handleFileSelect"
            class="hidden"
          />
        </div>

        <!-- 警告提示 -->
        <div v-if="importMode === 'replace'" class="p-3 bg-error-50 dark:bg-error-950 border border-error-200 dark:border-error-800 rounded-lg">
          <div class="flex items-start gap-2">
            <UIcon name="i-mdi-alert" class="text-error-600 dark:text-error-400 mt-0.5" />
            <div class="text-sm text-error-900 dark:text-error-100">
              <p class="font-medium">注意：替换模式将删除所有现有链接！</p>
              <p class="text-error-700 dark:text-error-300 mt-1">
                请确保您已经备份了重要数据，此操作不可撤销。
              </p>
            </div>
          </div>
        </div>
      </div>
    </UCard>

    <!-- 关于信息 -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold flex items-center gap-2">
          <UIcon name="i-mdi-information" />
          关于 LinkLantern
        </h2>
      </template>

      <div class="space-y-4">
        <div>
          <h3 class="font-medium mb-2">项目简介</h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            LinkLantern 是一个现代化的个人链接管理与分享平台，基于 Nuxt 4 构建。
            它提供了完整的链接收藏、分类、搜索和分享功能，帮助您更好地管理和组织网络资源。
          </p>
        </div>

        <UDivider />

        <div>
          <h3 class="font-medium mb-2">主要功能</h3>
          <ul class="text-gray-600 dark:text-gray-400 text-sm space-y-1 list-disc list-inside">
            <li>链接收藏与分类管理</li>
            <li>多搜索引擎集成</li>
            <li>热点榜单聚合（50+ 平台）</li>
            <li>网页推荐与分享</li>
            <li>数据导入导出</li>
            <li>深色模式支持</li>
            <li>自定义首页背景</li>
            <li>必应每日壁纸</li>
          </ul>
        </div>

        <UDivider />

        <div>
          <h3 class="font-medium mb-2">技术栈</h3>
          <div class="flex flex-wrap gap-2">
            <UBadge color="success">Nuxt 4</UBadge>
            <UBadge color="info">Vue 3</UBadge>
            <UBadge color="primary">TypeScript</UBadge>
            <UBadge color="info">Tailwind CSS</UBadge>
            <UBadge color="warning">Prisma</UBadge>
            <UBadge color="info">MySQL</UBadge>
        </div>
        </div>

        <UDivider />

        <div class="text-center pt-4">
          <p class="text-gray-500 dark:text-gray-400 text-sm">
            Made with ❤️ by LinkLantern Team
          </p>
          <p class="text-gray-400 dark:text-gray-500 text-xs mt-1">
            Version 1.0.0 © 2026
          </p>
        </div>
      </div>
    </UCard>
  </div>
</template>
