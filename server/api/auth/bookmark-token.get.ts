/**
 * 查询是否已配置浏览器扩展令牌
 * GET /api/auth/bookmark-token
 */

import prisma from '../../utils/prisma'
import { requireAuth } from '../../utils/auth-middleware'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const userId = event.context.user!.userId

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { bookmarkToken: true },
  })

  return {
    success: true,
    data: {
      hasToken: !!user?.bookmarkToken,
    },
  }
})
