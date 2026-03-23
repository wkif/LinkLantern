/**
 * 新建 AI 话题
 * POST /api/ai/conversations
 * body: { title?: string }
 */

import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth-middleware'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const body = await readBody(event).catch(() => ({}))
    const title = typeof body?.title === 'string' && body.title.trim()
      ? body.title.trim().slice(0, 200)
      : '新话题'

    const conv = await prisma.aiConversation.create({
      data: {
        userId: user.userId,
        title,
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return { success: true, data: conv }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('创建 AI 话题错误:', error)
    throw createError({ statusCode: 500, statusMessage: '创建话题失败' })
  }
})
