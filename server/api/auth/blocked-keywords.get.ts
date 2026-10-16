/**
 * 获取热榜关键词屏蔽列表
 * GET /api/auth/blocked-keywords
 *
 * 需要在请求头中携带 JWT 令牌：
 * Authorization: Bearer <token>
 *
 * 返回：
 * { success: true, data: { keywords: string[] } }
 */

import prisma from '../../utils/prisma'
import { requireAuth } from '../../utils/auth-middleware'

/** 判断错误是否为带状态码的 H3 错误（已创建的 createError） */
export function hasStatusCode(error: unknown): error is { statusCode: number } {
  return typeof error === 'object' && error !== null && 'statusCode' in error
    && typeof error.statusCode === 'number'
}

/** 解析并规范化 blockedKeywords JSON 字段：去非字符串、去空白、去重 */
export function normalizeBlockedKeywords(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return Array.from(new Set(
    value
      .filter((k): k is string => typeof k === 'string')
      .map(k => k.trim())
      .filter(k => k.length > 0),
  ))
}

export default defineEventHandler(async (event) => {
  try {
    const authUser = await requireAuth(event)

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { blockedKeywords: true },
    })

    return {
      success: true,
      data: {
        keywords: normalizeBlockedKeywords(user?.blockedKeywords),
      },
    }
  } catch (error: unknown) {
    if (hasStatusCode(error)) {
      throw error
    }

    console.error('获取屏蔽关键词错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '获取屏蔽关键词失败',
    })
  }
})
