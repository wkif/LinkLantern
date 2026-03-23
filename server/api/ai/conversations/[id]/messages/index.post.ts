/**
 * 在话题下追加一条消息
 * POST /api/ai/conversations/:id/messages
 * body: { role: 'user' | 'assistant', content: string }
 */

import prisma from '../../../../../utils/prisma'
import { requireAuth } from '../../../../../utils/auth-middleware'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const id = parseInt(event.context.params?.id || '')

    if (isNaN(id)) {
      throw createError({ statusCode: 400, statusMessage: '无效的话题 ID' })
    }

    const body = await readBody(event)
    const { role, content } = body

    if (!role || !['user', 'assistant'].includes(role)) {
      throw createError({ statusCode: 400, statusMessage: 'role 须为 user 或 assistant' })
    }

    if (typeof content !== 'string') {
      throw createError({ statusCode: 400, statusMessage: 'content 须为字符串' })
    }

    const conv = await prisma.aiConversation.findFirst({
      where: { id, userId: user.userId },
    })

    if (!conv) {
      throw createError({ statusCode: 404, statusMessage: '话题不存在' })
    }

    const msg = await prisma.aiMessage.create({
      data: {
        conversationId: id,
        role,
        content,
      },
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true,
      },
    })

    // 首条用户消息时，用内容摘要更新话题标题
    if (role === 'user') {
      const count = await prisma.aiMessage.count({
        where: { conversationId: id, role: 'user' },
      })
      if (count === 1 && (conv.title === '新话题' || !conv.title)) {
        const snippet = content.trim().replace(/\s+/g, ' ').slice(0, 80)
        if (snippet) {
          await prisma.aiConversation.update({
            where: { id },
            data: { title: snippet.length >= 80 ? `${snippet}…` : snippet },
          })
        }
      }
    }

    await prisma.aiConversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    })

    return { success: true, data: msg }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('保存 AI 消息错误:', error)
    throw createError({ statusCode: 500, statusMessage: '保存消息失败' })
  }
})
