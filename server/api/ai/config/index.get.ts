/**
 * 获取用户的 AI 配置列表
 * GET /api/ai/config
 *
 * 需要认证
 */

import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth-middleware'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)

    const configs = await prisma.aiConfig.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        baseUrl: true,
        model: true,
        maxTokens: true,
        temperature: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return {
      success: true,
      data: configs,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('获取 AI 配置错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '获取 AI 配置失败',
    })
  }
})
