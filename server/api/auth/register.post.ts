/**
 * 用户注册 API
 * POST /api/auth/register
 * 
 * 请求体：
 * {
 *   email: string,
 *   password: string,
 *   name?: string
 * }
 */

import prisma from '../../utils/prisma'
import { hashPassword, isValidEmail, validatePassword, generateAccessToken, generateRefreshToken } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password, name } = body
    
    // 验证必填字段
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: '邮箱和密码为必填项',
      })
    }
    
    // 验证邮箱格式
    if (!isValidEmail(email)) {
      throw createError({
        statusCode: 400,
        statusMessage: '邮箱格式不正确',
      })
    }
    
    // 验证密码强度
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      throw createError({
        statusCode: 400,
        statusMessage: passwordValidation.message,
      })
    }
    
    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })
    
    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: '该邮箱已被注册',
      })
    }
    
    // 加密密码
    const hashedPassword = await hashPassword(password)
    
    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
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
        createdAt: true,
      },
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
    
    return {
      success: true,
      message: '注册成功',
      data: {
        user,
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
    console.error('注册错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '注册失败，请稍后重试',
    })
  }
})

