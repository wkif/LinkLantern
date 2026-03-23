/**
 * 当前用户的 AI 话题列表
 * GET /api/ai/conversations
 */

import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth-middleware'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)

    const list = await prisma.aiConversation.findMany({
      where: { userId: user.userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { messages: true } },
      },
    })

    return {
      success: true,
      data: list.map((c) => ({
        id: c.id,
        title: c.title,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        messageCount: c._count.messages,
      })),
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('获取 AI 话题列表错误:', error)
    throw createError({ statusCode: 500, statusMessage: '获取话题列表失败' })
  }
})
