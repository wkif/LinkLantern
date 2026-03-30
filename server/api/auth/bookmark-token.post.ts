/**
 * 生成或轮换浏览器扩展令牌（仅返回一次明文）
 * POST /api/auth/bookmark-token
 * Body: { rotate?: boolean } — rotate 为 true 时强制换新并作废旧令牌
 */

import crypto from 'node:crypto'
import prisma from '../../utils/prisma'
import { requireAuth } from '../../utils/auth-middleware'

function newToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event).catch(() => ({}))
  const rotate = Boolean(body?.rotate)

  const existing = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { bookmarkToken: true },
  })

  if (existing?.bookmarkToken && !rotate) {
    throw createError({
      statusCode: 409,
      statusMessage: '已存在扩展令牌，如需更换请选择重新生成',
    })
  }

  const token = newToken()
  await prisma.user.update({
    where: { id: user.userId },
    data: { bookmarkToken: token },
  })

  return {
    success: true,
    message: rotate ? '已生成新令牌，旧令牌立即失效' : '令牌已生成，请立即复制保存',
    data: { token },
  }
})
