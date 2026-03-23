/**
 * 获取话题下的消息
 * GET /api/ai/conversations/:id/messages
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

    const conv = await prisma.aiConversation.findFirst({
      where: { id, userId: user.userId },
    })

    if (!conv) {
      throw createError({ statusCode: 404, statusMessage: '话题不存在' })
    }

    const messages = await prisma.aiMessage.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true,
      },
    })

    return { success: true, data: messages }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('获取 AI 消息错误:', error)
    throw createError({ statusCode: 500, statusMessage: '获取消息失败' })
  }
})
