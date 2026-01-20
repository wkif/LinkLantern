<!--
  背景设置组件
  功能：
  - 自定义背景图片上传
  - 必应每日壁纸切换
  - 背景透明度和模糊度配置
  - 实时预览效果
-->
<script setup lang="ts">
const toast = useToast()
const { updateHomeBackground, deleteHomeBackground, toggleBingWallpaper, updateBackgroundConfig, user } = useAuth()

// 背景图片上传状态
const backgroundInput = ref<HTMLInputElement | null>(null)
const uploadingBackground = ref(false)
const previewBackground = ref<string | null>(null)

// 必应壁纸开关状态
const useBingWallpaper = ref(false)
const togglingBingWallpaper = ref(false)

// 背景配置状态
const backgroundOpacity = ref(80)
const backgroundBlur = ref(8)
const updatingConfig = ref(false)

// 必应壁纸预览 URL
const bingWallpaperUrl = 'https://uapis.cn/api/v1/image/bing-daily'

// 初始化预览背景和必应壁纸状态
onMounted(() => {
  if (user.value?.homeBackground) {
    previewBackground.value = user.value.homeBackground
  }
  useBingWallpaper.value = user.value?.useBingWallpaper || false
  backgroundOpacity.value = user.value?.backgroundOpacity || 80
  backgroundBlur.value = user.value?.backgroundBlur || 8
})

// 监听用户状态变化
watch(() => user.value?.useBingWallpaper, (newVal) => {
  useBingWallpaper.value = newVal || false
})

watch(() => user.value?.backgroundOpacity, (newVal) => {
  if (newVal !== undefined) backgroundOpacity.value = newVal
})

watch(() => user.value?.backgroundBlur, (newVal) => {
  if (newVal !== undefined) backgroundBlur.value = newVal
})

/**
 * 更新背景配置（防抖）
 */
let configUpdateTimer: NodeJS.Timeout | null = null
const handleConfigUpdate = async (config: { opacity?: number; blur?: number }) => {
  // 清除之前的定时器
  if (configUpdateTimer) {
    clearTimeout(configUpdateTimer)
  }
  
  // 延迟更新，实现防抖
  configUpdateTimer = setTimeout(async () => {
    updatingConfig.value = true
    try {
      const result = await updateBackgroundConfig(config)
      
      if (!result?.success) {
        toast.add({
          title: '更新失败',
          description: result?.message || '背景配置更新失败',
          color: 'error',
          icon: 'i-mdi-alert-circle',
        })
      }
    } catch (error: any) {
      console.error('更新背景配置失败:', error)
    } finally {
      updatingConfig.value = false
    }
  }, 500) // 500ms 防抖
}

// 监听配置变化，实时更新
watch(backgroundOpacity, (newVal) => {
  handleConfigUpdate({ opacity: newVal })
})

watch(backgroundBlur, (newVal) => {
  handleConfigUpdate({ blur: newVal })
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (configUpdateTimer) {
    clearTimeout(configUpdateTimer)
  }
})

/**
 * 切换必应壁纸
 */
const handleToggleBingWallpaper = async (value: boolean) => {
  togglingBingWallpaper.value = true
  
  try {
    const result = await toggleBingWallpaper(value)
    
    if (result?.success) {
      toast.add({
        title: '设置成功',
        description: result.message || '必应壁纸设置已更新',
        color: 'success',
        icon: 'i-mdi-check-circle',
      })
      // 如果启用了必应壁纸，清除预览
      if (value) {
        previewBackground.value = null
      }
    } else {
      // 失败时恢复原状态
      useBingWallpaper.value = !value
      toast.add({
        title: '设置失败',
        description: result?.message || '必应壁纸设置失败',
        color: 'error',
        icon: 'i-mdi-alert-circle',
      })
    }
  } catch (error: any) {
    // 失败时恢复原状态
    useBingWallpaper.value = !value
    console.error('切换必应壁纸失败:', error)
    toast.add({
      title: '设置失败',
      description: error.message || '切换必应壁纸时发生错误',
      color: 'error',
      icon: 'i-mdi-alert-circle',
    })
  } finally {
    togglingBingWallpaper.value = false
  }
}

/**
 * 触发背景图片选择
 */
const triggerBackgroundUpload = () => {
  backgroundInput.value?.click()
}

/**
 * 处理背景图片选择
 */
const handleBackgroundSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    toast.add({
      title: '文件类型错误',
      description: '请选择图片文件',
      color: 'error',
      icon: 'i-mdi-alert-circle',
    })
    return
  }

  // 验证文件大小（限制为 4MB，因为 base64 编码后约增加 33%，避免超过数据库 6MB 限制）
  const sizeInMB = file.size / (1024 * 1024)
  if (sizeInMB > 4) {
    toast.add({
      title: '文件过大',
      description: '背景图片大小不能超过 4MB（数据库存储限制）',
      color: 'error',
      icon: 'i-mdi-alert-circle',
    })
    return
  }

  uploadingBackground.value = true
  
  try {
    // 读取文件并转换为 base64
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = e.target?.result as string
      
      // 预览
      previewBackground.value = base64
      
      // 上传到服务器
      const result = await updateHomeBackground(base64)
      
      if (result?.success) {
        toast.add({
          title: '上传成功',
          description: '背景图片已更新',
          color: 'success',
          icon: 'i-mdi-check-circle',
        })
      } else {
        // 上传失败，清除预览
        previewBackground.value = user.value?.homeBackground || null
        toast.add({
          title: '上传失败',
          description: result?.message || '背景图片上传失败',
          color: 'error',
          icon: 'i-mdi-alert-circle',
        })
      }
      
      uploadingBackground.value = false
    }
    
    reader.onerror = () => {
      toast.add({
        title: '读取失败',
        description: '无法读取图片文件',
        color: 'error',
        icon: 'i-mdi-alert-circle',
      })
      uploadingBackground.value = false
    }
    
    reader.readAsDataURL(file)
  } catch (error: any) {
    console.error('上传背景失败:', error)
    toast.add({
      title: '上传失败',
      description: error.message || '背景图片上传时发生错误',
      color: 'error',
      icon: 'i-mdi-alert-circle',
    })
    uploadingBackground.value = false
  } finally {
    // 清除文件选择
    if (target) target.value = ''
  }
}

/**
 * 删除背景图片
 */
const handleDeleteBackground = async () => {
  uploadingBackground.value = true
  
  try {
    const result = await deleteHomeBackground()
    
    if (result?.success) {
      previewBackground.value = null
      toast.add({
        title: '删除成功',
        description: '背景图片已删除',
        color: 'success',
        icon: 'i-mdi-check-circle',
      })
    } else {
      toast.add({
        title: '删除失败',
        description: result?.message || '删除背景图片失败',
        color: 'error',
        icon: 'i-mdi-alert-circle',
      })
    }
  } catch (error: any) {
    console.error('删除背景失败:', error)
    toast.add({
      title: '删除失败',
      description: error.message || '删除背景时发生错误',
      color: 'error',
      icon: 'i-mdi-alert-circle',
    })
  } finally {
    uploadingBackground.value = false
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <h2 class="text-lg font-semibold flex items-center gap-2">
        <UIcon name="i-mdi-image" />
        首页背景设置
      </h2>
    </template>

    <div class="space-y-6">
      <!-- 必应壁纸开关 -->
      <div class="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-mdi-image-multiple" class="text-blue-600 dark:text-blue-400 text-xl" />
              <h3 class="font-semibold text-blue-900 dark:text-blue-100">启用必应每日壁纸</h3>
            </div>
            <p class="text-sm text-blue-700 dark:text-blue-300 mb-2">
              每天自动使用必应搜索引擎的精美壁纸作为首页背景，无需手动上传。
            </p>
            <p class="text-xs text-blue-600 dark:text-blue-400">
              ✨ 启用后将自动清除自定义背景，每次访问首页都会显示最新的必应壁纸。
            </p>
          </div>
          <div class="flex-shrink-0 flex items-center">
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                v-model="useBingWallpaper" 
                :disabled="togglingBingWallpaper"
                @change="handleToggleBingWallpaper(($event.target as HTMLInputElement).checked)"
                class="sr-only peer"
              />
              <div class="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
            </label>
          </div>
        </div>
      </div>

      <UDivider label="或" />

      <!-- 自定义背景上传 -->
      <div>
        <div class="flex items-center gap-2 mb-4">
          <h3 class="font-medium">自定义背景图片</h3>
          <UBadge v-if="useBingWallpaper" color="neutral" variant="subtle" size="xs">
            已禁用（必应壁纸已启用）
          </UBadge>
        </div>
        
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          上传自己喜欢的图片作为首页背景。
        </p>

        <!-- 背景预览 -->
        <div v-if="previewBackground && !useBingWallpaper" class="relative">
          <div class="w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
            <img 
              :src="previewBackground" 
              alt="背景预览" 
              class="w-full h-full object-cover"
            />
          </div>
          <div class="absolute top-2 right-2 flex gap-2">
            <UBadge color="success" variant="solid">
              当前背景
            </UBadge>
          </div>
        </div>

        <div v-else-if="!useBingWallpaper" class="w-full h-48 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
          <div class="text-center text-gray-500 dark:text-gray-400">
            <UIcon name="i-mdi-image-off" class="text-5xl mb-2" />
            <p class="text-sm">暂无背景图片</p>
          </div>
        </div>

        <div v-else class="w-full h-48 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-600 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20">
          <div class="text-center text-blue-600 dark:text-blue-400">
            <UIcon name="i-mdi-image-multiple" class="text-5xl mb-2" />
            <p class="text-sm font-medium">已启用必应每日壁纸</p>
            <p class="text-xs mt-1">首页将显示必应搜索的精美壁纸</p>
          </div>
        </div>

        <!-- 实时预览区域 -->
        <div v-if="previewBackground || useBingWallpaper" class="mt-6">
          <div class="flex items-center gap-2 mb-3">
            <UIcon name="i-mdi-eye" class="text-lg" />
            <h4 class="font-medium">实时预览</h4>
            <UBadge v-if="updatingConfig" color="info" variant="subtle" size="xs">
              <span class="flex items-center gap-1">
                <UIcon name="i-mdi-loading" class="animate-spin" />
                更新中
              </span>
            </UBadge>
          </div>
          
          <!-- 预览框 -->
          <div class="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
            <!-- 背景层 -->
            <div 
              class="absolute inset-0"
              :style="{
                backgroundImage: useBingWallpaper 
                  ? `url(${bingWallpaperUrl})` 
                  : `url(${previewBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }"
            ></div>
            
            <!-- 遮罩层 -->
            <div 
              class="absolute inset-0 bg-white dark:bg-gray-900"
              :style="{
                opacity: backgroundOpacity / 100,
                backdropFilter: `blur(${backgroundBlur}px)`,
                WebkitBackdropFilter: `blur(${backgroundBlur}px)`
              }"
            ></div>
            
            <!-- 示例内容 -->
            <div class="relative z-10 p-6 flex flex-col items-center justify-center h-full">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                LinkLantern
              </h3>
              <p class="text-gray-600 dark:text-gray-400 mb-4">
                这是首页背景效果预览
              </p>
              <div class="flex gap-2">
                <div class="px-4 py-2 bg-primary rounded-lg text-white shadow-lg">
                  示例卡片 1
                </div>
                <div class="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                  示例卡片 2
                </div>
              </div>
            </div>
          </div>
          
          <!-- 配置滑块 -->
          <div class="mt-6 space-y-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <!-- 透明度控制 -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-sm font-medium flex items-center gap-2">
                  <UIcon name="i-mdi-opacity" />
                  遮罩透明度
                </label>
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  {{ backgroundOpacity }}%
                </span>
              </div>
              <input
                type="range"
                v-model.number="backgroundOpacity"
                min="0"
                max="100"
                step="5"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
              />
              <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>透明（0%）</span>
                <span>不透明（100%）</span>
              </div>
            </div>
            
            <!-- 模糊度控制 -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-sm font-medium flex items-center gap-2">
                  <UIcon name="i-mdi-blur" />
                  背景模糊度
                </label>
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  {{ backgroundBlur }}px
                </span>
              </div>
              <input
                type="range"
                v-model.number="backgroundBlur"
                min="0"
                max="20"
                step="1"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
              />
              <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>清晰（0px）</span>
                <span>模糊（20px）</span>
              </div>
            </div>
            
            <!-- 预设配置 -->
            <div>
              <label class="text-sm font-medium mb-2 block">快速预设</label>
              <div class="flex flex-wrap gap-2">
                <button
                  @click="backgroundOpacity = 70; backgroundBlur = 4"
                  class="px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  清晰风格
                </button>
                <button
                  @click="backgroundOpacity = 80; backgroundBlur = 8"
                  class="px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  标准风格（推荐）
                </button>
                <button
                  @click="backgroundOpacity = 90; backgroundBlur = 12"
                  class="px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  朦胧风格
                </button>
                <button
                  @click="backgroundOpacity = 95; backgroundBlur = 16"
                  class="px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  极简风格
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-3 flex-wrap mt-6">
          <UButton 
            @click="triggerBackgroundUpload"
            :loading="uploadingBackground"
            :disabled="uploadingBackground || useBingWallpaper"
            color="primary"
            icon="i-mdi-upload"
          >
            {{ previewBackground ? '更换背景' : '上传背景' }}
          </UButton>

          <UButton 
            v-if="previewBackground && !useBingWallpaper"
            @click="handleDeleteBackground"
            :loading="uploadingBackground"
            :disabled="uploadingBackground"
            color="error"
            variant="outline"
            icon="i-mdi-delete"
          >
            删除背景
          </UButton>
        </div>

        <!-- 隐藏的文件输入 -->
        <input
          ref="backgroundInput"
          type="file"
          accept="image/*"
          @change="handleBackgroundSelect"
          class="hidden"
        />

        <!-- 提示信息 -->
        <div v-if="!useBingWallpaper" class="p-3 bg-info-50 dark:bg-info-950 border border-info-200 dark:border-info-800 rounded-lg mt-6">
          <div class="flex items-start gap-2">
            <UIcon name="i-mdi-information" class="text-info-600 dark:text-info-400 mt-0.5" />
            <div class="text-sm text-info-900 dark:text-info-100">
              <p class="font-medium mb-1">使用提示：</p>
              <ul class="list-disc list-inside space-y-1 text-info-700 dark:text-info-300">
                <li>支持 JPG、PNG、GIF、WebP 等常见图片格式</li>
                <li>图片大小不能超过 4MB（数据库存储限制）</li>
                <li>建议使用横向图片，分辨率 1920x1080 以上</li>
                <li>背景图片会自动适配不同屏幕尺寸</li>
                <li>建议使用图片压缩工具（如 TinyPNG）减小文件大小</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

