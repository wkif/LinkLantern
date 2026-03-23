<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'admin',
})

const toast = useToast()
const { configs, fetchConfigs, fetchActiveConfig, createConfig, updateConfig, deleteConfig, activateConfig } = useAi()

// 弹窗状态
const showModal = ref(false)
const editingConfig = ref<any>(null)
const submitting = ref(false)

// 表单数据
const formData = ref({
  name: '',
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o',
  maxTokens: 4096,
  temperature: 0.7,
  isActive: false,
})

// 打开弹窗
const openModal = (config?: any) => {
  if (config) {
    editingConfig.value = config
    formData.value = {
      name: config.name,
      apiKey: '',
      baseUrl: config.baseUrl,
      model: config.model,
      maxTokens: config.maxTokens,
      temperature: config.temperature,
      isActive: config.isActive,
    }
  } else {
    editingConfig.value = null
    formData.value = {
      name: '',
      apiKey: '',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4o',
      maxTokens: 4096,
      temperature: 0.7,
      isActive: configs.value.length === 0,
    }
  }
  showModal.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formData.value.name || (!editingConfig.value && !formData.value.apiKey)) {
    toast.add({
      title: '请填写必填项',
      color: 'error',
    })
    return
  }

  submitting.value = true
  try {
    if (editingConfig.value) {
      const updateData: any = {
        name: formData.value.name,
        baseUrl: formData.value.baseUrl,
        model: formData.value.model,
        maxTokens: formData.value.maxTokens,
        temperature: formData.value.temperature,
        isActive: formData.value.isActive,
      }
      if (formData.value.apiKey) {
        updateData.apiKey = formData.value.apiKey
      }
      await updateConfig(editingConfig.value.id, updateData)
    } else {
      await createConfig({
        name: formData.value.name,
        apiKey: formData.value.apiKey,
        baseUrl: formData.value.baseUrl,
        model: formData.value.model,
        maxTokens: formData.value.maxTokens,
        temperature: formData.value.temperature,
        isActive: formData.value.isActive,
      })
    }
    showModal.value = false
  } finally {
    submitting.value = false
  }
}

// 删除配置
const handleDelete = async (id: number) => {
  if (confirm('确定要删除这个 AI 配置吗？')) {
    await deleteConfig(id)
  }
}

// 激活配置
const handleActivate = async (id: number) => {
  await activateConfig(id)
}

// 初始化
onMounted(() => {
  fetchConfigs()
  fetchActiveConfig()
})
</script>

<template>
  <div class="ai-admin-page">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">AI 配置管理</h1>
      <p class="text-gray-500 dark:text-gray-400 mt-1">管理你的 AI 对话配置</p>
    </div>

    <!-- 配置列表 -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">AI 配置列表</h2>
          <UButton color="primary" @click="openModal()">
            <template #leading>
              <UIcon name="i-mdi-plus" />
            </template>
            添加配置
          </UButton>
        </div>
      </template>

      <!-- 配置卡片 -->
      <div v-if="configs.length > 0" class="grid gap-4">
        <div
          v-for="config in configs"
          :key="config.id"
          class="relative bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border-2 transition-all"
          :class="config.isActive ? 'border-primary-500 shadow-md' : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'"
        >
          <!-- 激活状态 -->
          <div v-if="config.isActive" class="absolute -top-2 -right-2">
            <UBadge color="primary" variant="solid">
              <template #leading>
                <UIcon name="i-mdi-check-circle" />
              </template>
              已激活
            </UBadge>
          </div>

          <!-- 配置信息 -->
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {{ config.name }}
              </h3>
              <div class="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                <p>模型: {{ config.model }}</p>
                <p>API: {{ config.baseUrl }}</p>
                <p>Max Tokens: {{ config.maxTokens }} | Temperature: {{ config.temperature }}</p>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex gap-2 ml-4">
              <UButton
                v-if="!config.isActive"
                size="sm"
                variant="ghost"
                @click="handleActivate(config.id)"
              >
                <template #leading>
                  <UIcon name="i-mdi-check" />
                </template>
                激活
              </UButton>
              <UButton
                size="sm"
                variant="ghost"
                color="warning"
                @click="openModal(config)"
              >
                <template #leading>
                  <UIcon name="i-mdi-pencil" />
                </template>
              </UButton>
              <UButton
                size="sm"
                variant="ghost"
                color="error"
                @click="handleDelete(config.id)"
              >
                <template #leading>
                  <UIcon name="i-mdi-delete" />
                </template>
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="text-center py-12">
        <div class="bg-gray-100 dark:bg-gray-800 rounded-full p-6 mx-auto w-20 h-20 flex items-center justify-center mb-4">
          <UIcon name="i-mdi-robot" class="text-3xl text-gray-400" />
        </div>
        <p class="text-gray-500 dark:text-gray-400 mb-4">暂无 AI 配置</p>
        <UButton color="primary" @click="openModal()">
          <template #leading>
            <UIcon name="i-mdi-plus" />
          </template>
          添加第一个配置
        </UButton>
      </div>
    </UCard>

    <!-- 添加/编辑弹窗 -->
    <UModal v-model:open="showModal" :title="editingConfig ? '编辑配置' : '添加配置'">
      <template #body>
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <!-- 基本信息 -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <UIcon name="i-mdi-information" />
              基本信息
            </h3>

            <div class="grid grid-cols-1 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">
                  配置名称 <span class="text-red-500">*</span>
                </label>
                <UInput
                  v-model="formData.name"
                  placeholder="如: GPT-4, Claude-3"
                  size="lg"
                  icon="i-mdi-tag"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">
                  API Key <span class="text-red-500">*</span>
                </label>
                <UInput
                  v-model="formData.apiKey"
                  type="password"
                  placeholder="OpenAI API Key"
                  size="lg"
                  icon="i-mdi-key"
                  :hint="editingConfig ? '留空则不修改' : ''"
                  :required="!editingConfig"
                />
              </div>
            </div>
          </div>

          <!-- API 配置 -->
          <div class="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <UIcon name="i-mdi-cog" />
              API 配置
            </h3>

            <div class="grid grid-cols-1 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">API 地址</label>
                <UInput
                  v-model="formData.baseUrl"
                  placeholder="https://api.openai.com/v1"
                  size="lg"
                  icon="i-mdi-web"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">模型</label>
                <UInput
                  v-model="formData.model"
                  placeholder="如: gpt-4o, claude-3-5-sonnet-20241022"
                  size="lg"
                  icon="i-mdi-robot"
                />
              </div>
            </div>
          </div>

          <!-- 高级选项 -->
          <div class="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <UIcon name="i-mdi-tune" />
              高级选项
            </h3>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">Max Tokens</label>
                <UInput
                  v-model.number="formData.maxTokens"
                  type="number"
                  :min="1"
                  :max="128000"
                  size="lg"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Temperature</label>
                <UInput
                  v-model.number="formData.temperature"
                  type="number"
                  :min="0"
                  :max="2"
                  :step="0.1"
                  size="lg"
                />
              </div>
            </div>
          </div>

          <!-- 激活选项 -->
          <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
            <UCheckbox v-model="formData.isActive" label="创建后立即激活" />
          </div>
        </form>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="gray" @click="showModal = false">取消</UButton>
          <UButton color="primary" :loading="submitting" @click="handleSubmit">
            {{ editingConfig ? '保存' : '创建' }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
