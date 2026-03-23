<template>
  <div class="ai-chat-container flex h-[600px] min-h-[400px]">
    <!-- 话题侧栏 -->
    <aside class="ai-chat-sidebar w-52 shrink-0 flex flex-col border-r border-gray-200 dark:border-gray-700">
      <div class="p-2 border-b border-gray-200 dark:border-gray-700">
        <UButton
          block
          size="sm"
          color="primary"
          :disabled="streaming"
          @click="handleNewTopic"
        >
          <template #leading>
            <UIcon name="i-mdi-plus" />
          </template>
          新建话题
        </UButton>
      </div>
      <div class="flex-1 overflow-y-auto p-1 space-y-0.5">
        <button
          v-for="c in conversations"
          :key="c.id"
          type="button"
          class="w-full text-left rounded-lg px-2 py-2 text-sm transition-colors group flex items-start gap-1"
          :class="activeConversationId === c.id
            ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-800 dark:text-primary-200'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200'"
          @click="selectConversation(c.id)"
        >
          <span class="flex-1 min-w-0 line-clamp-2 font-medium">{{ c.title }}</span>
          <UButton
            size="xs"
            color="neutral"
            variant="ghost"
            icon="i-mdi-delete-outline"
            class="shrink-0 opacity-0 group-hover:opacity-100"
            :disabled="streaming"
            @click.stop="handleDeleteTopic(c.id)"
          />
        </button>
        <p v-if="conversations.length === 0" class="px-2 py-4 text-xs text-gray-500 text-center">
          暂无话题，点击「新建」或发送首条消息自动创建
        </p>
      </div>
    </aside>

    <!-- 主聊天区 -->
    <div class="flex flex-col flex-1 min-w-0">
    <!-- 对话所用 AI 配置（可切换，与后台「默认激活」独立） -->
    <div class="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/50">
      <span class="text-xs font-medium text-gray-600 dark:text-gray-400 shrink-0">对话配置</span>
      <select
        class="flex-1 min-w-[10rem] max-w-md rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100"
        :value="chatConfigId ?? ''"
        :disabled="streaming || !configs.length"
        @change="onChatConfigSelect(($event.target as HTMLSelectElement).value)"
      >
        <option v-if="!configs.length" value="" disabled>暂无配置</option>
        <option
          v-for="c in configs"
          :key="c.id"
          :value="String(c.id)"
        >
          {{ c.name }} — {{ c.model }}{{ c.isActive ? '（默认）' : '' }}
        </option>
      </select>
      <UButton
        v-if="chatConfigId != null && activeConfig?.id !== chatConfigId"
        size="xs"
        variant="soft"
        color="neutral"
        :disabled="streaming"
        @click="handleSetDefaultConfig"
      >
        设为默认
      </UButton>
    </div>

    <!-- 聊天消息区域 -->
    <div ref="messagesContainerRef" class="flex-1 overflow-y-auto p-4 space-y-4">
      <!-- 欢迎消息 -->
      <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-center py-12">
        <div class="bg-primary-100 dark:bg-primary-900/30 rounded-full p-6 mb-4">
          <UIcon name="i-mdi-robot" class="text-5xl text-primary" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          AI 对话助手
        </h3>
        <p class="text-gray-500 dark:text-gray-400 max-w-md">
          {{
            selectedChatConfig
              ? `当前对话：${selectedChatConfig.name} · ${selectedChatConfig.model}`
              : configs.length
                ? '请在上方选择要使用的配置'
                : '请先在后台「AI 配置」中添加配置'
          }}
        </p>
        <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">
          选择左侧话题或新建话题，发送消息将自动保存
        </p>
      </div>

      <!-- 消息列表 -->
      <div
        v-for="(message, index) in messages"
        :key="index"
        class="flex gap-3"
        :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <!-- 助手头像 -->
        <div
          v-if="message.role === 'assistant'"
          class="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center"
        >
          <UIcon name="i-mdi-robot" class="text-lg text-primary" />
        </div>

        <!-- 消息内容 -->
        <div
          class="max-w-[80%] rounded-2xl px-4 py-3 min-w-0"
          :class="message.role === 'user'
            ? 'bg-primary-500 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'"
        >
          <template v-if="message.role === 'assistant'">
            <div
              class="ai-md break-words"
              v-html="renderAssistantHtml(message.content)"
            />
            <span
              v-if="streaming && index === messages.length - 1"
              class="inline-block animate-pulse align-baseline ml-0.5"
            >▊</span>
          </template>
          <!-- 用户：纯文本（支持换行） -->
          <div
            v-else
            class="whitespace-pre-wrap break-words"
          >
            {{ message.content }}
          </div>
        </div>

        <!-- 用户头像 -->
        <div
          v-if="message.role === 'user'"
          class="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
        >
          <UIcon name="i-mdi-account" class="text-lg text-gray-600 dark:text-gray-300" />
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="flex justify-center">
        <div class="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm">
          {{ error }}
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="border-t border-gray-200 dark:border-gray-700 p-4">
      <div class="flex items-end gap-2">
        <UTextarea
          v-model="inputMessage"
          placeholder="输入消息…（Enter 发送，Shift+Enter 换行）"
          :rows="4"
          class="flex-1 min-w-0"
          size="lg"
          :disabled="chatConfigId == null || streaming"
          @keydown.enter.exact.prevent="handleSend"
        />
        <UButton
          size="lg"
          class="shrink-0"
          :disabled="!inputMessage.trim() || chatConfigId == null || streaming"
          @click="handleSend"
        >
          <UIcon :name="streaming ? 'i-mdi-loading' : 'i-mdi-send'" :class="{ 'animate-spin': streaming }" />
        </UButton>
      </div>
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
        Enter 发送 · Shift+Enter 换行
      </p>
      <p v-if="!configs.length" class="text-xs text-amber-600 dark:text-amber-400 mt-1 text-center">
        请先在后台「AI 配置」中添加至少一个配置
      </p>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import DOMPurify from 'dompurify'

marked.setOptions({ gfm: true, breaks: true })
marked.use({
  renderer: {
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens)
      const titleAttr = title ? ` title="${title.replace(/"/g, '&quot;')}"` : ''
      const safeHref = href ?? ''
      return `<a href="${safeHref}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`
    },
  },
})

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderAssistantHtml(src: string) {
  if (!src) return ''
  if (!import.meta.client) {
    return `<p class="whitespace-pre-wrap">${escapeHtml(src)}</p>`
  }
  try {
    const raw = marked.parse(src, { async: false }) as string
    return DOMPurify.sanitize(raw, {
      ADD_ATTR: ['target', 'rel'],
    })
  } catch {
    return DOMPurify.sanitize(`<p>${escapeHtml(src)}</p>`)
  }
}

const {
  messages,
  streaming,
  error,
  activeConfig,
  configs,
  chatConfigId,
  selectedChatConfig,
  conversations,
  activeConversationId,
  sendMessage,
  fetchActiveConfig,
  fetchConfigs,
  fetchConversations,
  createConversation,
  selectConversation,
  deleteConversation,
  activateConfig,
} = useAi()

const inputMessage = ref('')
const messagesContainerRef = ref<HTMLElement | null>(null)

function onChatConfigSelect(raw: string) {
  chatConfigId.value = raw ? Number(raw) : null
}

async function handleSetDefaultConfig() {
  if (chatConfigId.value == null) return
  await activateConfig(chatConfigId.value)
}

onMounted(async () => {
  await Promise.all([fetchConfigs(), fetchActiveConfig(), fetchConversations()])
})

const handleNewTopic = async () => {
  await createConversation()
}

const handleDeleteTopic = async (id: number) => {
  if (!confirm('确定删除该话题及全部消息？')) return
  await deleteConversation(id)
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainerRef.value) {
      messagesContainerRef.value.scrollTop = messagesContainerRef.value.scrollHeight
    }
  })
}

watch(messages, () => {
  scrollToBottom()
}, { deep: true })

watch(streaming, (v) => {
  if (v) scrollToBottom()
})

const handleSend = async () => {
  if (!inputMessage.value.trim() || streaming.value) return

  const content = inputMessage.value.trim()
  inputMessage.value = ''

  await sendMessage(content)
}
</script>

<style scoped>
.ai-chat-container {
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  border: 1px solid #e5e7eb;
}
:deep(.dark) .ai-chat-container {
  background-color: #111827;
  border-color: #374151;
}

/* Markdown 内容样式 */
.ai-md :deep(p) {
  margin: 0.5em 0;
}
.ai-md :deep(p:first-child) {
  margin-top: 0;
}
.ai-md :deep(p:last-child) {
  margin-bottom: 0;
}
.ai-md :deep(h1),
.ai-md :deep(h2),
.ai-md :deep(h3),
.ai-md :deep(h4) {
  font-weight: 600;
  margin: 0.75em 0 0.35em;
  line-height: 1.3;
}
.ai-md :deep(h1) { font-size: 1.25rem; }
.ai-md :deep(h2) { font-size: 1.1rem; }
.ai-md :deep(h3) { font-size: 1rem; }
.ai-md :deep(ul),
.ai-md :deep(ol) {
  margin: 0.5em 0;
  padding-left: 1.25rem;
}
.ai-md :deep(li) {
  margin: 0.25em 0;
}
.ai-md :deep(blockquote) {
  margin: 0.5em 0;
  padding-left: 0.75rem;
  border-left: 3px solid rgb(86 57 80 / 0.35);
  color: rgb(107 114 128);
}
:deep(.dark) .ai-md :deep(blockquote) {
  border-left-color: rgb(195 171 189 / 0.5);
  color: rgb(156 163 175);
}
.ai-md :deep(pre) {
  margin: 0.5em 0;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  font-size: 0.8125rem;
  line-height: 1.5;
  background: rgb(243 244 246);
}
:deep(.dark) .ai-md :deep(pre) {
  background: rgb(31 41 55);
}
.ai-md :deep(code) {
  font-family: ui-monospace, monospace;
  font-size: 0.875em;
}
.ai-md :deep(p code),
.ai-md :deep(li code) {
  padding: 0.125rem 0.35rem;
  border-radius: 0.25rem;
  background: rgb(229 231 235);
}
:deep(.dark) .ai-md :deep(p code),
:deep(.dark) .ai-md :deep(li code) {
  background: rgb(55 65 81);
}
.ai-md :deep(pre code) {
  padding: 0;
  background: transparent;
  font-size: inherit;
}
.ai-md :deep(a) {
  color: #563950;
  text-decoration: underline;
  text-underline-offset: 2px;
}
:deep(.dark) .ai-md :deep(a) {
  color: #c3abbd;
}
.ai-md :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0.5em 0;
  font-size: 0.875rem;
}
.ai-md :deep(th),
.ai-md :deep(td) {
  border: 1px solid rgb(229 231 235);
  padding: 0.35rem 0.5rem;
  text-align: left;
}
:deep(.dark) .ai-md :deep(th),
:deep(.dark) .ai-md :deep(td) {
  border-color: rgb(55 65 81);
}
.ai-md :deep(hr) {
  margin: 0.75em 0;
  border: none;
  border-top: 1px solid rgb(229 231 235);
}
:deep(.dark) .ai-md :deep(hr) {
  border-top-color: rgb(55 65 81);
}
.ai-md :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.375rem;
}
</style>
