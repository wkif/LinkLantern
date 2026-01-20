/**
 * 更新背景配置 API
 * PUT /api/auth/background-config
 * 
 * 需要在请求头中携带 JWT 令牌：
 * Authorization: Bearer <token>
 * 
 * 请求体：
 * {
 *   opacity?: number,  // 遮罩透明度 0-100
 *   blur?: number      // 模糊度 0-20
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
    const { opacity, blur } = body

    // 构建更新数据
    const updateData: any = {}
    
    if (opacity !== undefined) {
      // 验证透明度范围
      if (typeof opacity !== 'number' || opacity < 0 || opacity > 100) {
        throw createError({
          statusCode: 400,
          statusMessage: '透明度必须在 0-100 之间',
        })
      }
      updateData.backgroundOpacity = opacity
    }
    
    if (blur !== undefined) {
      // 验证模糊度范围
      if (typeof blur !== 'number' || blur < 0 || blur > 20) {
        throw createError({
          statusCode: 400,
          statusMessage: '模糊度必须在 0-20 之间',
        })
      }
      updateData.backgroundBlur = blur
    }

    // 如果没有要更新的数据
    if (Object.keys(updateData).length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '没有要更新的配置',
      })
    }

    // 更新用户配置
    const updatedUser = await prisma.user.update({
      where: { id: authUser.userId },
      data: updateData,
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
      message: '背景配置更新成功',
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
    console.error('更新背景配置错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '更新配置失败',
    })
  }
})

