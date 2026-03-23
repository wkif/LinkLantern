// AI 对话 composable

interface AiConfig {
  id: number
  name: string
  baseUrl: string
  model: string
  maxTokens: number
  temperature: number
  isActive: boolean
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AiConversationSummary {
  id: number
  title: string
  createdAt: string
  updatedAt: string
  messageCount: number
}

export const useAi = () => {
  const configs = ref<AiConfig[]>([])
  const activeConfig = ref<AiConfig | null>(null)
  /** 当前对话使用的配置（可切换，不必等于后台「默认激活」） */
  const chatConfigId = ref<number | null>(null)
  const messages = ref<ChatMessage[]>([])
  const conversations = ref<AiConversationSummary[]>([])
  const activeConversationId = ref<number | null>(null)

  const loading = ref(false)
  const streaming = ref(false)
  const error = ref<string | null>(null)

  const { accessToken } = useAuth()
  const toast = useToast()

  const getAuthHeaders = () => ({
    Authorization: accessToken.value ? `Bearer ${accessToken.value}` : '',
  })

  /** 列表 / 默认激活变化时，保证 chatConfigId 指向有效配置 */
  const ensureChatConfigSelection = () => {
    const list = configs.value
    if (!list.length) {
      chatConfigId.value = null
      return
    }
    const ids = new Set(list.map((c) => c.id))
    if (chatConfigId.value !== null && !ids.has(chatConfigId.value)) {
      chatConfigId.value = null
    }
    if (chatConfigId.value === null) {
      const preferred = activeConfig.value?.id
      chatConfigId.value =
        preferred !== undefined && ids.has(preferred) ? preferred : list[0]!.id
    }
  }

  const selectedChatConfig = computed(() =>
    configs.value.find((c) => c.id === chatConfigId.value) ?? null,
  )

  const fetchConfigs = async () => {
    try {
      const res = await $fetch<{ success: boolean; data: AiConfig[] }>('/api/ai/config', {
        headers: getAuthHeaders(),
      })
      if (res.success) {
        configs.value = res.data
        ensureChatConfigSelection()
      }
    } catch (err: any) {
      console.error('获取 AI 配置失败:', err)
    }
  }

  const fetchActiveConfig = async () => {
    try {
      const res = await $fetch<{ success: boolean; data: AiConfig | null }>('/api/ai/config/active', {
        headers: getAuthHeaders(),
      })
      if (res.success) {
        activeConfig.value = res.data
        ensureChatConfigSelection()
      }
    } catch (err: any) {
      console.error('获取激活配置失败:', err)
    }
  }

  /** 话题列表 */
  const fetchConversations = async () => {
    try {
      const res = await $fetch<{ success: boolean; data: AiConversationSummary[] }>(
        '/api/ai/conversations',
        { headers: getAuthHeaders() },
      )
      if (res.success) {
        conversations.value = res.data
      }
    } catch (err: any) {
      console.error('获取话题列表失败:', err)
    }
  }

  /** 新建话题并切换到该话题（清空当前消息区） */
  const createConversation = async (title?: string) => {
    try {
      const res = await $fetch<{ success: boolean; data: { id: number; title: string } }>(
        '/api/ai/conversations',
        {
          method: 'POST',
          body: title ? { title } : {},
          headers: getAuthHeaders(),
        },
      )
      if (res.success) {
        activeConversationId.value = res.data.id
        messages.value = []
        error.value = null
        await fetchConversations()
        toast.add({ title: '已新建话题', color: 'success' })
        return res.data
      }
    } catch (err: any) {
      toast.add({ title: err.data?.statusMessage || '创建话题失败', color: 'error' })
      throw err
    }
    return null
  }

  /** 静默确保有话题 ID（发送首条消息且未选话题时） */
  const ensureConversationId = async (): Promise<number | null> => {
    if (activeConversationId.value) return activeConversationId.value
    try {
      const res = await $fetch<{ success: boolean; data: { id: number } }>(
        '/api/ai/conversations',
        {
          method: 'POST',
          body: {},
          headers: getAuthHeaders(),
        },
      )
      if (res.success) {
        activeConversationId.value = res.data.id
        messages.value = []
        await fetchConversations()
        return res.data.id
      }
    } catch (err: any) {
      console.error('自动创建话题失败:', err)
      toast.add({ title: err.data?.statusMessage || '创建话题失败', color: 'error' })
    }
    return null
  }

  /** 切换话题并加载历史消息 */
  const selectConversation = async (id: number) => {
    if (streaming.value) {
      toast.add({ title: '回复生成中，请稍候', color: 'warning' })
      return
    }
    try {
      const res = await $fetch<{
        success: boolean
        data: { id: number; role: string; content: string; createdAt: string }[]
      }>(`/api/ai/conversations/${id}/messages`, {
        headers: getAuthHeaders(),
      })
      if (res.success) {
        activeConversationId.value = id
        error.value = null
        messages.value = res.data.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))
      }
    } catch (err: any) {
      toast.add({ title: err.data?.statusMessage || '加载消息失败', color: 'error' })
    }
  }

  /** 删除话题 */
  const deleteConversation = async (id: number) => {
    try {
      await $fetch(`/api/ai/conversations/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      toast.add({ title: '话题已删除', color: 'success' })
      if (activeConversationId.value === id) {
        activeConversationId.value = null
        messages.value = []
      }
      await fetchConversations()
    } catch (err: any) {
      toast.add({ title: err.data?.statusMessage || '删除失败', color: 'error' })
      throw err
    }
  }

  const persistMessage = async (conversationId: number, role: 'user' | 'assistant', content: string) => {
    await $fetch(`/api/ai/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: { role, content },
    })
  }

  const createConfig = async (config: Partial<AiConfig> & { name: string; apiKey: string }) => {
    try {
      const res = await $fetch<{ success: boolean; data: AiConfig }>('/api/ai/config', {
        method: 'POST',
        body: config,
        headers: getAuthHeaders(),
      })
      if (res.success) {
        toast.add({ title: '配置创建成功', color: 'success' })
        await fetchConfigs()
        if (config.isActive) {
          await fetchActiveConfig()
        }
        return res.data
      }
    } catch (err: any) {
      toast.add({ title: err.data?.statusMessage || '创建配置失败', color: 'error' })
      throw err
    }
  }

  const updateConfig = async (id: number, config: Partial<AiConfig> & { apiKey?: string }) => {
    try {
      const res = await $fetch<{ success: boolean; data: AiConfig }>(`/api/ai/config/${id}`, {
        method: 'PUT',
        body: config,
        headers: getAuthHeaders(),
      })
      if (res.success) {
        toast.add({ title: '配置更新成功', color: 'success' })
        await fetchConfigs()
        if (config.isActive) {
          await fetchActiveConfig()
        }
        return res.data
      }
    } catch (err: any) {
      toast.add({ title: err.data?.statusMessage || '更新配置失败', color: 'error' })
      throw err
    }
  }

  const deleteConfig = async (id: number) => {
    try {
      const res = await $fetch<{ success: boolean }>(`/api/ai/config/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      if (res.success) {
        toast.add({ title: '配置删除成功', color: 'success' })
        await fetchConfigs()
        if (activeConfig.value?.id === id) {
          activeConfig.value = null
        }
      }
    } catch (err: any) {
      toast.add({ title: err.data?.statusMessage || '删除配置失败', color: 'error' })
      throw err
    }
  }

  const activateConfig = async (configId: number) => {
    try {
      const res = await $fetch<{ success: boolean }>('/api/ai/config/active', {
        method: 'PUT',
        body: { configId },
        headers: getAuthHeaders(),
      })
      if (res.success) {
        toast.add({ title: '配置已激活', color: 'success' })
        await fetchConfigs()
        await fetchActiveConfig()
      }
    } catch (err: any) {
      toast.add({ title: err.data?.statusMessage || '激活配置失败', color: 'error' })
      throw err
    }
  }

  const appendAssistantChunk = (chunk: string) => {
    if (!chunk) return
    const idx = messages.value.length - 1
    const msg = messages.value[idx]
    if (!msg || msg.role !== 'assistant') return
    messages.value.splice(idx, 1, {
      role: 'assistant',
      content: msg.content + chunk,
    })
  }

  const parseSseDataLine = (rawLine: string) => {
    const line = rawLine.replace(/\r$/, '')
    if (!line.startsWith('data: ')) return null
    return line.slice(6)
  }

  const sendMessage = async (content: string, overrideConfigId?: number) => {
    if (!content.trim()) return

    const cfgId = overrideConfigId ?? chatConfigId.value
    if (cfgId == null) {
      toast.add({ title: '请先添加并选择 AI 配置', color: 'warning' })
      return
    }

    const convId = await ensureConversationId()
    if (!convId) return

    const text = content.trim()

    try {
      await persistMessage(convId, 'user', text)
    } catch (err: any) {
      toast.add({
        title: err.data?.statusMessage || '保存用户消息失败',
        color: 'error',
      })
      return
    }

    messages.value.push({ role: 'user', content: text })
    messages.value.push({ role: 'assistant', content: '' })

    streaming.value = true
    error.value = null

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          configId: cfgId,
          messages: messages.value.slice(0, -1),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.statusMessage || '请求失败')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('无法读取响应')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()

        if (done) {
          if (buffer) {
            const lines = buffer.split('\n')
            for (const line of lines) {
              const data = parseSseDataLine(line)
              if (data === null) continue
              if (data.startsWith('[ERROR]')) {
                throw new Error(data.slice(8))
              }
              appendAssistantChunk(data)
            }
          }
          break
        }

        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const data = parseSseDataLine(line)
          if (data === null) continue
          if (data.startsWith('[ERROR]')) {
            throw new Error(data.slice(8))
          }
          appendAssistantChunk(data)
        }
      }

      const last = messages.value[messages.value.length - 1]
      if (last?.role === 'assistant') {
        try {
          await persistMessage(convId, 'assistant', last.content)
        } catch (e) {
          console.error('保存助手回复失败:', e)
          toast.add({ title: '助手回复未能保存到云端', color: 'warning' })
        }
      }
      await fetchConversations()
    } catch (err: any) {
      const errorMsg = err.message || '对话失败'
      error.value = errorMsg
      toast.add({ title: errorMsg, color: 'error' })
      messages.value.pop()
    } finally {
      streaming.value = false
    }
  }

  const clearMessages = () => {
    messages.value = []
  }

  const init = async () => {
    await Promise.all([fetchConfigs(), fetchActiveConfig(), fetchConversations()])
  }

  return {
    configs,
    activeConfig,
    chatConfigId,
    selectedChatConfig,
    messages,
    conversations,
    activeConversationId,
    loading,
    streaming,
    error,
    fetchConfigs,
    fetchActiveConfig,
    fetchConversations,
    createConversation,
    selectConversation,
    deleteConversation,
    createConfig,
    updateConfig,
    deleteConfig,
    activateConfig,
    sendMessage,
    clearMessages,
    init,
  }
}
