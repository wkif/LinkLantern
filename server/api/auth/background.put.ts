/**
 * 更新用户首页背景 API
 * PUT /api/auth/background
 * 
 * 需要在请求头中携带 JWT 令牌：
 * Authorization: Bearer <token>
 * 
 * 请求体：
 * {
 *   background: string  // base64 格式的图片数据
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
    const { background } = body

    // 验证数据
    if (!background) {
      throw createError({
        statusCode: 400,
        statusMessage: '请提供背景图片数据',
      })
    }

    // 验证是否为 base64 格式
    if (!background.startsWith('data:image/')) {
      throw createError({
        statusCode: 400,
        statusMessage: '背景图片必须是 base64 格式（data:image/...）',
      })
    }

    // 验证文件大小（限制为 4MB，因为 base64 编码后会增加约 33%，避免超过数据库 6MB 限制）
    const base64Length = background.length
    const sizeInBytes = (base64Length * 3) / 4
    const sizeInMB = sizeInBytes / (1024 * 1024)
    
    if (sizeInMB > 4) {
      throw createError({
        statusCode: 400,
        statusMessage: '背景图片大小不能超过 4MB（数据库存储限制）',
      })
    }

    // 更新用户背景
    const updatedUser = await prisma.user.update({
      where: { id: authUser.userId },
      data: {
        homeBackground: background,
        // 如果上传了自定义背景，禁用必应壁纸
        useBingWallpaper: false,
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
      message: '背景图片上传成功',
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
    console.error('更新背景错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '更新背景失败',
    })
  }
})
