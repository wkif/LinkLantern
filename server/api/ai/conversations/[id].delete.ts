/**
 * 删除 AI 话题及下属消息
 * DELETE /api/ai/conversations/:id
 */

import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth-middleware'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const id = parseInt(event.context.params?.id || '')

    if (isNaN(id)) {
      throw createError({ statusCode: 400, statusMessage: '无效的话题 ID' })
    }

    const existing = await prisma.aiConversation.findFirst({
      where: { id, userId: user.userId },
    })

    if (!existing) {
      throw createError({ statusCode: 404, statusMessage: '话题不存在' })
    }

    await prisma.aiConversation.delete({ where: { id } })

    return { success: true, message: '话题已删除' }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('删除 AI 话题错误:', error)
    throw createError({ statusCode: 500, statusMessage: '删除话题失败' })
  }
})
