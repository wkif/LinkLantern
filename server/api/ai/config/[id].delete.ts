/**
 * 删除 AI 配置
 * DELETE /api/ai/config/:id
 *
 * 需要认证
 */

import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth-middleware'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const id = parseInt(event.context.params?.id || '')

    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        statusMessage: '无效的配置 ID',
      })
    }

    // 验证配置是否属于当前用户
    const existingConfig = await prisma.aiConfig.findFirst({
      where: { id, userId: user.userId },
    })

    if (!existingConfig) {
      throw createError({
        statusCode: 404,
        statusMessage: '配置不存在',
      })
    }

    await prisma.aiConfig.delete({
      where: { id },
    })

    return {
      success: true,
      message: 'AI 配置删除成功',
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('删除 AI 配置错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '删除 AI 配置失败',
    })
  }
})
