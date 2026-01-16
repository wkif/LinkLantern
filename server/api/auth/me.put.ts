/**
 * 更新当前用户信息 API
 * PUT /api/auth/me
 * 
 * 需要在请求头中携带 JWT 令牌：
 * Authorization: Bearer <token>
 * 
 * 请求体：
 * {
 *   name?: string,
 *   avatar?: string
 * }
 */

import prisma from '../../utils/prisma'
import { requireAuth } from '../../utils/auth-middleware'

export default defineEventHandler(async (event) => {
  try {
    // 验证用户身份
    const authUser = await requireAuth(event)
    
    const body = await readBody(event)
    const { name, avatar } = body
    
    // 构建更新数据
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (avatar !== undefined) updateData.avatar = avatar
    
    // 如果没有要更新的数据
    if (Object.keys(updateData).length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '没有要更新的数据',
      })
    }
    
    // 更新用户信息
    const user = await prisma.user.update({
      where: { id: authUser.userId },
      data: updateData,
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
    
    return {
      success: true,
      message: '更新成功',
      data: user,
    }
  } catch (error: any) {
    // 如果是已经创建的错误，直接抛出
    if (error.statusCode) {
      throw error
    }
    
    // 其他错误
    console.error('更新用户信息错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '更新用户信息失败',
    })
  }
})

