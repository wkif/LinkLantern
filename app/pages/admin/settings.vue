<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'admin',
})

const toast = useToast()
const { exportLinks: exportLinksAPI, importLinks: importLinksAPI } = useLinks()

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
