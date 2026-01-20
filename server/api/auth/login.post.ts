/**
 * 用户登录 API
 * POST /api/auth/login
 * 
 * 请求体：
 * {
 *   email: string,
 *   password: string
 * }
 */

import prisma from '../../utils/prisma'
import { verifyPassword, generateAccessToken, generateRefreshToken } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password } = body
    
    // 验证必填字段
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: '邮箱和密码为必填项',
      })
    }
    
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
    })
    
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: '邮箱或密码错误',
      })
    }
    
    // 检查账户是否激活
    if (!user.isActive) {
      throw createError({
        statusCode: 403,
        statusMessage: '账户已被禁用，请联系管理员',
      })
    }
    
    // 验证密码
    const isPasswordValid = await verifyPassword(password, user.password)
    
    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        statusMessage: '邮箱或密码错误',
      })
    }
    
    // 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })
    
    // 生成 JWT 令牌
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    })
    
    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    })
    
    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user
    
    return {
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: userWithoutPassword.id,
          email: userWithoutPassword.email,
          name: userWithoutPassword.name,
          avatar: userWithoutPassword.avatar,
          homeBackground: userWithoutPassword.homeBackground,
          useBingWallpaper: userWithoutPassword.useBingWallpaper,
          backgroundOpacity: userWithoutPassword.backgroundOpacity,
          backgroundBlur: userWithoutPassword.backgroundBlur,
          isActive: userWithoutPassword.isActive,
          emailVerified: userWithoutPassword.emailVerified,
          lastLoginAt: new Date(),
          createdAt: userWithoutPassword.createdAt,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    }
  } catch (error: any) {
    // 如果是已经创建的错误，直接抛出
    if (error.statusCode) {
      throw error
    }
    
    // 其他错误
    console.error('登录错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '登录失败，请稍后重试',
    })
  }
})

