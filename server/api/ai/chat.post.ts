/**
 * AI 对话接口 (SSE 流式输出)
 * POST /api/ai/chat
 *
 * 需要认证
 *
 * 请求体：
 * {
 *   messages: [{ role: 'user' | 'assistant', content: string }],
 *   configId?: number  // 可选，使用指定配置，否则使用激活的配置
 * }
 */

import prisma from '../../utils/prisma'
import { requireAuth } from '../../utils/auth-middleware'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const body = await readBody(event)
  const { messages, configId } = body

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: '消息不能为空',
    })
  }

  // 获取 AI 配置
  let config
  if (configId) {
    config = await prisma.aiConfig.findFirst({
      where: { id: configId, userId: user.userId },
    })
  } else {
    config = await prisma.aiConfig.findFirst({
      where: { userId: user.userId, isActive: true },
    })
  }

  if (!config) {
    throw createError({
      statusCode: 400,
      statusMessage: '请先配置并激活 AI',
    })
  }

  // 设置 SSE 响应头（减少代理/中间层缓冲，便于真正流式下发）
  setHeader(event, 'Content-Type', 'text/event-stream; charset=utf-8')
  setHeader(event, 'Cache-Control', 'no-cache, no-transform')
  setHeader(event, 'Connection', 'keep-alive')
  setHeader(event, 'X-Accel-Buffering', 'no')

  const res = event.node.res
  // 降低 TCP 粘包延迟，尽快把小块内容推到客户端
  const socket = res.socket
  if (socket && typeof (socket as any).setNoDelay === 'function') {
    (socket as any).setNoDelay(true)
  }

  res.flushHeaders()

  // 立即发送注释行唤醒流（SSE 规范允许以 : 开头的注释）
  res.write(': stream-start\n\n')

  try {
    // 调用 OpenAI 兼容 API
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        stream: true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      res.write(`data: [ERROR] ${response.status} - ${errorText}\n\n`)
      res.end()
      return
    }

    const reader = response.body?.getReader()
    if (!reader) {
      res.write('data: [ERROR] 无法读取响应流\n\n')
      res.end()
      return
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        // 处理最后的 buffer
        if (buffer) {
          try {
            const lines = buffer.split('\n')
            for (const line of lines) {
              const trimmed = line.replace(/\r$/, '')
              if (trimmed.startsWith('data: ')) {
                const data = trimmed.slice(6)
                if (data === '[DONE]') continue
                const parsed = JSON.parse(data)
                const content = parsed.choices?.[0]?.delta?.content || ''
                if (content) {
                  res.write(`data: ${content}\n\n`)
                }
              }
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
        break
      }

      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.replace(/\r$/, '')
        if (trimmed.startsWith('data: ')) {
          const data = trimmed.slice(6)
          if (data === '[DONE]') {
            res.end()
            return
          }

          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content || ''
            if (content) {
              res.write(`data: ${content}\n\n`)
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }

    res.end()
  } catch (error: any) {
    console.error('AI 对话错误:', error)
    res.write(`data: [ERROR] ${error.message || '对话失败'}\n\n`)
    res.end()
  }
})
