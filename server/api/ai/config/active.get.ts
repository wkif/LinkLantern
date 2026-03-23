/**
 * 获取当前激活的 AI 配置
 * GET /api/ai/config/active
 *
 * 需要认证
 */

import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth-middleware'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)

    const config = await prisma.aiConfig.findFirst({
      where: { userId: user.userId, isActive: true },
      select: {
        id: true,
        name: true,
        baseUrl: true,
        model: true,
        maxTokens: true,
        temperature: true,
        isActive: true,
      },
    })

    return {
      success: true,
      data: config,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('获取激活配置错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '获取激活配置失败',
    })
  }
})
