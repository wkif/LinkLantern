/**
 * 获取用户首页背景 API
 * GET /api/auth/background
 * 
 * 需要在请求头中携带 JWT 令牌：
 * Authorization: Bearer <token>
 */

import prisma from '../../utils/prisma'
import { requireAuth } from '../../utils/auth-middleware'

export default defineEventHandler(async (event) => {
  try {
    // 验证用户身份
    const authUser = await requireAuth(event)

    // 获取用户背景
    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: {
        homeBackground: true,
        useBingWallpaper: true,
        backgroundOpacity: true,
        backgroundBlur: true,
      },
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: '用户不存在',
      })
    }

    return {
      success: true,
      data: {
        background: user.homeBackground,
      },
    }
  } catch (error: any) {
    // 如果是已经创建的错误，直接抛出
    if (error.statusCode) {
      throw error
    }
    
    // 其他错误
    console.error('获取背景错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '获取背景失败',
    })
  }
})
