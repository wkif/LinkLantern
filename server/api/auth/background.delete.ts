/**
 * 删除用户首页背景 API
 * DELETE /api/auth/background
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

    // 删除用户背景（设置为 null）
    const updatedUser = await prisma.user.update({
      where: { id: authUser.userId },
      data: {
        homeBackground: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        homeBackground: true,
        useBingWallpaper: true,
        backgroundOpacity: true,
        backgroundBlur: true,
        isActive: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return {
      success: true,
      message: '背景图片已删除',
      data: {
        user: updatedUser,
      },
    }
  } catch (error: any) {
    // 如果是已经创建的错误，直接抛出
    if (error.statusCode) {
      throw error
    }
    
    // 其他错误
    console.error('删除背景错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '删除背景失败',
    })
  }
})
