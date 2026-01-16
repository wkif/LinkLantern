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
      mode: importMode.value,
    })
    
    if (result.success) {
      toast.add({
        title: '导入完成',
        description: result.message || '数据导入成功',
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
            {{ exporting ? '导出中...' : '导出链接数据' }}
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
          <div class="mb-4">
            <label class="text-sm font-medium mb-2 block">导入模式</label>
            <div class="space-y-3">
              <label class="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  v-model="importMode"
                  value="append"
                  class="mt-1"
                />
                <div>
                  <div class="font-medium">追加模式</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    保留现有数据，仅添加新链接（跳过重复）
                  </div>
                </div>
              </label>
              <label class="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  v-model="importMode"
                  value="replace"
                  class="mt-1"
                />
                <div>
                  <div class="font-medium">替换模式</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    删除所有现有数据，导入新数据
                  </div>
                </div>
              </label>
            </div>
          </div>

          <!-- 导入按钮 -->
          <div class="space-y-3">
            <UButton 
              @click="triggerImport"
              :loading="importing"
              :disabled="importing"
              color="primary"
              icon="i-mdi-upload"
            >
              {{ importing ? '导入中...' : '选择文件导入' }}
            </UButton>
            
            <!-- 替换模式警告 -->
            <div
              v-if="importMode === 'replace'"
              class="p-3 bg-error-50 dark:bg-error-950 border border-error-200 dark:border-error-800 rounded-lg flex items-start gap-2"
            >
              <UIcon name="i-mdi-alert" class="text-error-600 dark:text-error-400 mt-0.5" />
              <div>
                <div class="font-medium text-error-900 dark:text-error-100 text-sm">警告</div>
                <div class="text-error-700 dark:text-error-300 text-xs mt-1">
                  替换模式会删除所有现有链接！
                </div>
              </div>
            </div>
          </div>

          <!-- 隐藏的文件输入 -->
          <input
            ref="fileInput"
            type="file"
            accept=".json"
            @change="handleFileSelect"
            class="hidden"
          />

          <!-- 数据格式说明 -->
          <details class="mt-4">
            <summary class="text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100">
              JSON 数据格式说明
            </summary>
            <div class="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded text-xs">
              <pre class="overflow-x-auto">{
  "version": "1.0",
  "exportDate": "2026-01-16T...",
  "totalLinks": 10,
  "links": [
    {
      "url": "https://example.com",
      "title": "示例网站",
      "description": "描述（可选）",
      "icon": "图标URL（可选）",
      "category": "分类（可选）",
      "isPublic": false
    }
  ]
}</pre>
            </div>
          </details>
        </div>
      </div>
    </UCard>

    <!-- 关于 -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold flex items-center gap-2">
          <UIcon name="i-mdi-information" />
          应用信息
        </h2>
      </template>

      <div class="space-y-3 text-sm">
        <div class="flex items-center justify-between">
          <span class="text-gray-600 dark:text-gray-400">应用名称</span>
          <span class="font-medium">LinkLantern</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-600 dark:text-gray-400">版本号</span>
          <span class="font-medium">1.0.0</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-600 dark:text-gray-400">框架</span>
          <span class="font-medium">Nuxt 4</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-600 dark:text-gray-400">UI 组件库</span>
          <span class="font-medium">Nuxt UI</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-600 dark:text-gray-400">数据库</span>
          <span class="font-medium">Prisma + MySQL</span>
        </div>
        <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 class="font-medium mb-2">关于 LinkLantern</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            LinkLantern 是一个现代化的个人链接管理工具，帮助您收藏和分享优质网站。
          </p>
          <div class="space-y-2 text-gray-600 dark:text-gray-400">
            <p>✨ 特色功能：</p>
            <ul class="list-disc list-inside space-y-1 ml-2">
              <li>智能搜索，支持多个搜索引擎</li>
              <li>实时热点榜单，聚合 50+ 平台</li>
              <li>链接收藏与分类管理</li>
              <li>公开分享优质链接</li>
              <li>完整的用户认证系统</li>
              <li>响应式设计，支持深色模式</li>
              <li>数据导入导出，方便备份迁移</li>
            </ul>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

