/**
 * 激活指定的 AI 配置
 * PUT /api/ai/config/active
 *
 * 需要认证
 *
 * 请求体：
 * {
 *   configId: number
 * }
 */

import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth-middleware'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const body = await readBody(event)
    const { configId } = body

    if (!configId) {
      throw createError({
        statusCode: 400,
        statusMessage: '配置 ID 不能为空',
      })
    }

    // 验证配置是否属于当前用户
    const existingConfig = await prisma.aiConfig.findFirst({
      where: { id: configId, userId: user.userId },
    })

    if (!existingConfig) {
      throw createError({
        statusCode: 404,
        statusMessage: '配置不存在',
      })
    }

    // 取消其他配置的激活状态
    await prisma.aiConfig.updateMany({
      where: { userId: user.userId },
      data: { isActive: false },
    })

    // 激活指定配置
    await prisma.aiConfig.update({
      where: { id: configId },
      data: { isActive: true },
    })

    return {
      success: true,
      message: 'AI 配置已激活',
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('激活 AI 配置错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '激活 AI 配置失败',
    })
  }
})
