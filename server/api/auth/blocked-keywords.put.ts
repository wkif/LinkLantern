/**
 * 整体替换热榜关键词屏蔽列表
 * PUT /api/auth/blocked-keywords
 *
 * 需要在请求头中携带 JWT 令牌：
 * Authorization: Bearer <token>
 *
 * 请求体：
 * { keywords: string[] }  // 全量覆盖（新增、编辑、删除均整体提交）
 *
 * 返回：
 * { success: true, data: { keywords: string[] } }
 */

import prisma from '../../utils/prisma'
import { requireAuth } from '../../utils/auth-middleware'
import { hasStatusCode, normalizeBlockedKeywords } from './blocked-keywords.get'

const MAX_KEYWORDS = 200
const MAX_KEYWORD_LENGTH = 50

export default defineEventHandler(async (event) => {
  try {
    const authUser = await requireAuth(event)

    const body: unknown = await readBody(event)
    const keywords = body && typeof body === 'object' && 'keywords' in body
      ? body.keywords
      : undefined

    if (!Array.isArray(keywords)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'keywords 必须是字符串数组',
      })
    }

    if (keywords.length > MAX_KEYWORDS) {
      throw createError({
        statusCode: 400,
        statusMessage: `关键词数量不能超过 ${MAX_KEYWORDS} 个`,
      })
    }

    for (const keyword of keywords) {
      if (typeof keyword !== 'string' || !keyword.trim()) {
        throw createError({
          statusCode: 400,
          statusMessage: '关键词不能为空',
        })
      }
      if (keyword.trim().length > MAX_KEYWORD_LENGTH) {
        throw createError({
          statusCode: 400,
          statusMessage: `单个关键词长度不能超过 ${MAX_KEYWORD_LENGTH} 个字符`,
        })
      }
    }

    const normalized = normalizeBlockedKeywords(keywords)

    await prisma.user.update({
      where: { id: authUser.userId },
      data: { blockedKeywords: normalized },
    })

    return {
      success: true,
      message: '屏蔽关键词已保存',
      data: {
        keywords: normalized,
      },
    }
  } catch (error: unknown) {
    if (hasStatusCode(error)) {
      throw error
    }

    console.error('保存屏蔽关键词错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '保存屏蔽关键词失败',
    })
  }
})
