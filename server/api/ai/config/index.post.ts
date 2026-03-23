/**
 * 创建新的 AI 配置
 * POST /api/ai/config
 *
 * 需要认证
 *
 * 请求体：
 * {
 *   name: string,
 *   apiKey: string,
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

    const body = await readBody(event)
    const { name, apiKey, baseUrl, model, maxTokens, temperature, isActive } = body

    // 验证必填字段
    if (!name || !apiKey) {
      throw createError({
        statusCode: 400,
        statusMessage: '配置名称和 API Key 为必填项',
      })
    }

    // 如果激活此配置，先取消其他配置的激活状态
    if (isActive) {
      await prisma.aiConfig.updateMany({
        where: { userId: user.userId },
        data: { isActive: false },
      })
    }

    // 创建配置
    const config = await prisma.aiConfig.create({
      data: {
        name,
        apiKey,
        baseUrl: baseUrl || 'https://api.openai.com/v1',
        model: model || 'gpt-4o',
        maxTokens: maxTokens || 4096,
        temperature: temperature ?? 0.7,
        isActive: isActive || false,
        userId: user.userId,
      },
    })

    return {
      success: true,
      message: 'AI 配置创建成功',
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

    console.error('创建 AI 配置错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '创建 AI 配置失败',
    })
  }
})
