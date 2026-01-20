/**
 * 切换必应壁纸设置 API
 * PUT /api/auth/bing-wallpaper
 * 
 * 需要在请求头中携带 JWT 令牌：
 * Authorization: Bearer <token>
 * 
 * 请求体：
 * {
 *   enabled: boolean  // 是否启用必应壁纸
 * }
 */

import prisma from '../../utils/prisma'
import { requireAuth } from '../../utils/auth-middleware'

export default defineEventHandler(async (event) => {
  try {
    // 验证用户身份
    const authUser = await requireAuth(event)
    
    // 获取请求体数据
    const body = await readBody(event)
    const { enabled } = body

    // 验证数据
    if (typeof enabled !== 'boolean') {
      throw createError({
        statusCode: 400,
        statusMessage: '请提供有效的开关状态',
      })
    }

    // 更新用户设置
    const updatedUser = await prisma.user.update({
      where: { id: authUser.userId },
      data: {
        useBingWallpaper: enabled,
        // 如果启用必应壁纸，清除自定义背景
        ...(enabled && { homeBackground: null }),
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
      message: enabled ? '已启用必应壁纸' : '已关闭必应壁纸',
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
    console.error('更新必应壁纸设置错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '更新设置失败',
    })
  }
})

