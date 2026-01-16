/**
 * 获取当前登录用户信息 API
 * GET /api/auth/me
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
    
    // 获取完整的用户信息
    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        isActive: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
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
      data: user,
    }
  } catch (error: any) {
    // 如果是已经创建的错误，直接抛出
    if (error.statusCode) {
      throw error
    }
    
    // 其他错误
    console.error('获取用户信息错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '获取用户信息失败',
    })
  }
})

