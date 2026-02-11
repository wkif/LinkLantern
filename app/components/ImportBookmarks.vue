<script setup lang="ts">
/**
 * 浏览器书签导入组件
 * 支持从Chrome、Firefox、Edge等浏览器导入书签HTML文件
 */

const emit = defineEmits<{
  success: []
}>()

const toast = useToast()
const { accessToken } = useAuth()

// 状态管理
const uploading = ref(false)
const importing = ref(false)
const importMode = ref<'append' | 'replace'>('append')
const showModal = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

// 解析和预览状态
const parsedBookmarks = ref<Array<{
  url: string
  title: string
  category?: string
  icon?: string
}>>([])
const showPreview = ref(false)

// 导入结果
const importResult = ref<{
  imported: number
  skipped: number
  total: number
} | null>(null)

// 打开文件选择
const openFilePicker = () => {
  showModal.value = true
}

// 选择文件
const selectFile = () => {
  fileInputRef.value?.click()
}

// 前端解析 Firefox JSON 格式
const parseFirefoxJson = (jsonData: any) => {
  const bookmarks: Array<{ url: string; title: string; category?: string; icon?: string }> = []

  function traverse(node: any, categoryPath: string[] = []) {
    if (node.type === 'text/x-moz-place-container') {
      const folderName = node.title
      if (!node.root && folderName && folderName !== 'menu' && folderName !== 'toolbar' && folderName !== 'unfiled' && folderName !== 'mobile') {
        categoryPath = [...categoryPath, folderName]
      }

      if (node.children && Array.isArray(node.children)) {
        for (const child of node.children) {
          traverse(child, categoryPath)
        }
      }
    }
    else if (node.type === 'text/x-moz-place' && node.uri) {
      const url = node.uri
      const title = node.title || url
      const category = categoryPath.length > 0 ? categoryPath[categoryPath.length - 1] : undefined
      const icon = node.iconUri || undefined

      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        bookmarks.push({ url, title, category, icon })
      }
    }
  }

  if (jsonData.children && Array.isArray(jsonData.children)) {
    for (const child of jsonData.children) {
      traverse(child)
    }
  }

  return bookmarks
}

// 前端解析 HTML 格式
const parseBookmarksHtml = (html: string) => {
  const bookmarks: Array<{ url: string; title: string; category?: string; icon?: string }> = []
  const cleanHtml = html.replace(/\n/g, ' ').replace(/\s+/g, ' ')
  const folderStack: string[] = []

  const dtRegex = /<DT>(.*?)<\/DT>|<DT>(.*?)(?=<DT>|<\/DL>)/gi
  let match

  while ((match = dtRegex.exec(cleanHtml)) !== null) {
    const content = match[1] || match[2]

    // 匹配文件夹
    const folderMatch = content.match(/<H3[^>]*>(.*?)<\/H3>/i)
    if (folderMatch) {
      const folderName = folderMatch[1].trim()
      folderStack.push(folderName)
      continue
    }

    // 匹配链接
    const linkMatch = content.match(/<A\s+HREF="([^"]+)"([^>]*?)>(.*?)<\/A>/i)
    if (linkMatch) {
      const url = linkMatch[1].trim()
      const attributes = linkMatch[2]
      const title = linkMatch[3].replace(/<[^>]+>/g, '').trim()

      const iconMatch = attributes.match(/ICON="([^"]+)"/i)
      const icon = iconMatch ? iconMatch[1] : undefined

      const category = folderStack.length > 0 ? folderStack[folderStack.length - 1] : undefined

      if (url && url.startsWith('http')) {
        bookmarks.push({ url, title: title || url, category, icon })
      }
    }
  }

  return bookmarks
}

// 处理文件上传 - 解析并预览
const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // 检查文件类型
  const isHtml = file.name.endsWith('.html') || file.name.endsWith('.htm')
  const isJson = file.name.endsWith('.json')

  if (!isHtml && !isJson) {
    toast.add({
      title: '文件格式错误',
      description: '请选择 HTML 或 JSON 格式的书签文件',
      color: 'error',
    })
    return
  }

  // 读取并解析文件
  uploading.value = true
  parsedBookmarks.value = []
  importResult.value = null

  try {
    const content = await readFileAsText(file)

    // 尝试解析
    try {
      // 先尝试 JSON
      const jsonData = JSON.parse(content)
      if (jsonData.type === 'text/x-moz-place-container' || (jsonData.children && Array.isArray(jsonData.children))) {
        parsedBookmarks.value = parseFirefoxJson(jsonData)
      } else {
        throw new Error('不是有效的 Firefox 书签格式')
      }
    } catch (jsonError) {
      // 尝试 HTML
      if (content.includes('<!DOCTYPE NETSCAPE-Bookmark-file') || content.includes('<DL><p>')) {
        parsedBookmarks.value = parseBookmarksHtml(content)
      } else {
        throw new Error('不支持的书签格式')
      }
    }

    if (parsedBookmarks.value.length === 0) {
      toast.add({
        title: '解析失败',
        description: '未能从文件中解析出有效的书签',
        color: 'error',
      })
      return
    }

    // 显示预览
    showPreview.value = true
    toast.add({
      title: '解析成功',
      description: `已解析 ${parsedBookmarks.value.length} 个书签，请确认后导入`,
      color: 'success',
    })
  } catch (error: any) {
    console.error('解析书签失败:', error)
    toast.add({
      title: '解析失败',
      description: error.message || '请检查文件格式',
      color: 'error',
    })
  } finally {
    uploading.value = false
    // 清空文件选择
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }
}

// 确认导入
const confirmImport = async () => {
  if (parsedBookmarks.value.length === 0) return

  importing.value = true

  try {
    // 直接发送解析后的书签数据
    const response = await $fetch<any>('/api/links/import-bookmarks', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
      body: {
        bookmarks: parsedBookmarks.value,  // 发送解析后的数组
        mode: importMode.value,
      },
    })

    if (response.success) {
      importResult.value = response.data
      showPreview.value = false
      toast.add({
        title: '导入成功',
        description: response.message,
        color: 'success',
      })

      // 触发成功事件，通知父组件刷新数据
      emit('success')
    }
  } catch (error: any) {
    console.error('导入书签失败:', error)
    toast.add({
      title: '导入失败',
      description: error.data?.statusMessage || error.message || '请稍后重试',
      color: 'error',
    })
  } finally {
    importing.value = false
  }
}

// 取消预览
const cancelPreview = () => {
  showPreview.value = false
  parsedBookmarks.value = []
}

// 分类统计
const categoryCount = computed(() => {
  const categories = parsedBookmarks.value
    .map(b => b.category)
    .filter(Boolean) as string[]
  return new Set(categories).size
})

// 含图标数量
const iconCount = computed(() => {
  return parsedBookmarks.value.filter(b => b.icon).length
})

// 读取文件为文本
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(e.target?.result as string)
    }
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    reader.readAsText(file)
  })
}

// 关闭模态框
const closeModal = () => {
  showModal.value = false
  showPreview.value = false
  parsedBookmarks.value = []
  importResult.value = null
}

// 暴露方法给父组件
defineExpose({
  openFilePicker,
})
</script>

<template>
  <div>
    <!-- 触发按钮 -->
    <UButton icon="i-mdi-google-chrome" color="primary" size="lg" @click="openFilePicker">
      从浏览器导入
    </UButton>

    <!-- 导入模态框 -->
    <UModal v-model:open="showModal" title="从浏览器导入书签">
      <template #body>
        <div class="space-y-6">
          <!-- 解析预览 -->
          <div v-if="showPreview">
            <UAlert icon="i-mdi-check-circle" color="success" variant="subtle" title="解析成功"
              :description="`已解析出 ${parsedBookmarks.length} 个书签，请确认后导入`" />

            <!-- 统计信息 -->
            <div class="grid grid-cols-3 gap-4 mt-4">
              <UCard>
                <div class="text-center">
                  <p class="text-2xl font-bold text-primary">{{ parsedBookmarks.length }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">书签总数</p>
                </div>
              </UCard>
              <UCard>
                <div class="text-center">
                  <p class="text-2xl font-bold text-green-600">{{ categoryCount }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">分类数量</p>
                </div>
              </UCard>
              <UCard>
                <div class="text-center">
                  <p class="text-2xl font-bold text-blue-600">{{ iconCount }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">含图标</p>
                </div>
              </UCard>
            </div>

            <!-- 书签列表预览 -->
            <div class="mt-4">
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-medium">书签预览</h4>
                <UBadge color="neutral" variant="subtle">
                  仅显示前 20 条
                </UBadge>
              </div>
              <div class="border border-gray-200 dark:border-gray-700 rounded-lg max-h-96 overflow-y-auto">
                <div v-for="(bookmark, index) in parsedBookmarks.slice(0, 20)" :key="index"
                  class="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <!-- 图标 -->
                  <div
                    class="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                    <img v-if="bookmark.icon && !bookmark.icon.startsWith('i-')" :src="bookmark.icon"
                      class="w-6 h-6 rounded" @error="(e) => (e.target as HTMLImageElement).style.display = 'none'" />
                    <UIcon v-else name="i-mdi-web" class="text-gray-400" />
                  </div>

                  <!-- 信息 -->
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-sm truncate">{{ bookmark.title }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ bookmark.url }}</p>
                    <UBadge v-if="bookmark.category" size="xs" color="primary" variant="subtle" class="mt-1">
                      {{ bookmark.category }}
                    </UBadge>
                  </div>
                </div>
              </div>
            </div>

            <!-- 确认导入按钮 -->
            <div class="flex gap-3 mt-4">
              <UButton color="primary" size="lg" block :loading="importing" :disabled="importing"
                @click="confirmImport">
                <template v-if="importing">
                  <UIcon name="i-mdi-loading" class="animate-spin" />
                  正在导入...
                </template>
                <template v-else>
                  <UIcon name="i-mdi-check" />
                  确认导入 {{ parsedBookmarks.length }} 个书签
                </template>
              </UButton>
              <UButton color="neutral" variant="outline" size="lg" :disabled="importing" @click="cancelPreview">
                取消
              </UButton>
            </div>
          </div>

          <!-- 文件选择界面 -->
          <div v-else>
            <!-- 使用说明 -->
            <UAlert icon="i-mdi-information" color="info" variant="subtle" title="使用说明"
              description="支持导入 Chrome、Firefox、Edge 等浏览器的书签文件 (HTML 或 JSON 格式)">
              <template #description>
                <div class="mt-2 space-y-2 text-sm">
                  <p class="font-medium">如何导出书签？</p>
                  <ul class="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                    <li><strong>Chrome:</strong> 设置 → 书签 → 书签管理器 → 导出书签 (HTML)</li>
                    <li><strong>Firefox:</strong> 书签 → 管理书签 → 导入和备份 → 导出书签 (HTML) 或 备份 (JSON)</li>
                    <li><strong>Edge:</strong> 收藏夹 → 管理收藏夹 → 导出收藏 (HTML)</li>
                  </ul>
                </div>
              </template>
            </UAlert>

            <!-- 导入模式选择 -->
            <div>
              <label class="block text-sm font-medium mb-3">导入模式</label>
              <div class="grid grid-cols-2 gap-3">
                <UCard class="cursor-pointer transition-all" :class="{
                  'ring-2 ring-primary': importMode === 'append',
                  'hover:bg-gray-50 dark:hover:bg-gray-800': importMode !== 'append',
                }" @click="importMode = 'append'">
                  <div class="flex items-start gap-3">
                    <URadio v-model="importMode" value="append" color="primary" />
                    <div class="flex-1">
                      <h4 class="font-medium mb-1">追加模式</h4>
                      <p class="text-sm text-gray-600 dark:text-gray-400">
                        保留现有链接，追加新链接（自动跳过重复）
                      </p>
                    </div>
                  </div>
                </UCard>

                <UCard class="cursor-pointer transition-all" :class="{
                  'ring-2 ring-error': importMode === 'replace',
                  'hover:bg-gray-50 dark:hover:bg-gray-800': importMode !== 'replace',
                }" @click="importMode = 'replace'">
                  <div class="flex items-start gap-3">
                    <URadio v-model="importMode" value="replace" color="error" />
                    <div class="flex-1">
                      <h4 class="font-medium mb-1 text-red-600 dark:text-red-400">
                        替换模式
                      </h4>
                      <p class="text-sm text-gray-600 dark:text-gray-400">
                        删除所有现有链接，导入新链接
                      </p>
                    </div>
                  </div>
                </UCard>
              </div>

              <!-- 替换模式警告 -->
              <UAlert v-if="importMode === 'replace'" icon="i-mdi-alert" color="error" variant="subtle" title="警告"
                description="替换模式将删除您的所有现有链接，此操作不可撤销！" class="mt-3" />
            </div>

            <!-- 文件上传区域 -->
            <div>
              <div
                class="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                :class="{ 'border-primary bg-primary-50 dark:bg-primary-950': uploading }" @click="selectFile">
                <input ref="fileInputRef" type="file" accept=".html,.htm,.json" class="hidden"
                  @change="handleFileChange" />

                <div v-if="!uploading">
                  <UIcon name="i-mdi-cloud-upload" class="text-5xl text-gray-400 dark:text-gray-500 mb-3" />
                  <p class="text-lg font-medium mb-1">
                    点击选择书签文件
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    支持 .html、.htm 或 .json 格式
                  </p>
                </div>

                <div v-else>
                  <UIcon name="i-mdi-loading" class="text-5xl text-primary animate-spin mb-3" />
                  <p class="text-lg font-medium">
                    正在导入书签...
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    请稍候，正在解析和保存书签数据
                  </p>
                </div>
              </div>
            </div>

            <!-- 导入结果 -->
            <UAlert v-if="importResult" icon="i-mdi-check-circle" color="success" variant="subtle" title="导入完成">
              <template #description>
                <div class="mt-2 space-y-1 text-sm">
                  <p>✅ 成功导入: <strong>{{ importResult.imported }}</strong> 个书签</p>
                  <p v-if="importResult.skipped > 0">
                    ⏭️ 跳过重复: <strong>{{ importResult.skipped }}</strong> 个
                  </p>
                  <p>📊 总计处理: <strong>{{ importResult.total }}</strong> 个</p>
                </div>
              </template>
            </UAlert>

            <!-- 示例说明 -->
            <details class="text-sm">
              <summary
                class="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                查看书签文件格式示例
              </summary>
              <div class="mt-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-x-auto">
                <pre class="text-xs"><code>&lt;!DOCTYPE NETSCAPE-Bookmark-file-1&gt;
          &lt;DL&gt;&lt;p&gt;
          &lt;DT&gt;&lt;H3&gt;工作&lt;/H3&gt;
          &lt;DL&gt;&lt;p&gt;
          &lt;DT&gt;&lt;A HREF="https://github.com"&gt;GitHub&lt;/A&gt;
          &lt;DT&gt;&lt;A HREF="https://stackoverflow.com"&gt;Stack Overflow&lt;/A&gt;
          &lt;/DL&gt;&lt;p&gt;
          &lt;DT&gt;&lt;H3&gt;学习&lt;/H3&gt;
          &lt;DL&gt;&lt;p&gt;
          &lt;DT&gt;&lt;A HREF="https://vuejs.org"&gt;Vue.js&lt;/A&gt;
          &lt;/DL&gt;&lt;p&gt;
          &lt;/DL&gt;&lt;p&gt;</code></pre>
              </div>
            </details>
          </div>
          <!-- 文件选择界面结束 -->
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="closeModal">
            关闭
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
