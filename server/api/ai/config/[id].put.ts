/**
 * 更新 AI 配置
 * PUT /api/ai/config/:id
 *
 * 需要认证
 *
 * 请求体：
 * {
 *   name?: string,
 *   apiKey?: string,
 *   baseUrl?: string,
 *   model?: string,
 *   maxTokens?: number,
 *   temperature?: number,
 *   isActive?: boolean
 * }
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

    const body = await readBody(event)

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

    // 如果激活此配置，先取消其他配置的激活状态
    if (body.isActive) {
      await prisma.aiConfig.updateMany({
        where: { userId: user.userId, id: { not: id } },
        data: { isActive: false },
      })
    }

    // 构建更新数据（不更新 apiKey 字段，保留原有值）
    const updateData: any = {}
    if (body.name) updateData.name = body.name
    if (body.baseUrl) updateData.baseUrl = body.baseUrl
    if (body.model) updateData.model = body.model
    if (body.maxTokens) updateData.maxTokens = body.maxTokens
    if (body.temperature !== undefined) updateData.temperature = body.temperature
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    // 如果提供了新的 apiKey，则更新
    if (body.apiKey) updateData.apiKey = body.apiKey

    const config = await prisma.aiConfig.update({
      where: { id },
      data: updateData,
    })

    return {
      success: true,
      message: 'AI 配置更新成功',
      data: {
        id: config.id,
        name: config.name,
        baseUrl: config.baseUrl,
        model: config.model,
        maxTokens: config.maxTokens,
        temperature: config.temperature,
        isActive: config.isActive,
      },
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('更新 AI 配置错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '更新 AI 配置失败',
    })
  }
})
