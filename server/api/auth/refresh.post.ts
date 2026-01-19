/**
 * 刷新访问令牌 API
 * 使用 refresh token 获取新的 access token
 */

import prisma from '../../utils/prisma'
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // 读取请求体
    const body = await readBody(event)
    const { refreshToken } = body

    // 验证必填字段
    if (!refreshToken) {
      throw createError({
        statusCode: 400,
        statusMessage: '请提供刷新令牌',
      })
    }

    // 验证 refresh token
    const payload = verifyRefreshToken(refreshToken)
    
    if (!payload) {
      throw createError({
        statusCode: 401,
        statusMessage: '刷新令牌无效或已过期',
      })
    }

    // 验证用户是否存在且激活
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        isActive: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
      },
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: '用户不存在',
      })
    }

    if (!user.isActive) {
      throw createError({
        statusCode: 403,
        statusMessage: '账户已被禁用',
      })
    }

    // 生成新的 token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
    }

    const newAccessToken = generateAccessToken(tokenPayload)
    const newRefreshToken = generateRefreshToken(tokenPayload)

    // 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // 返回新的 token 和用户信息
    return {
      success: true,
      message: '令牌刷新成功',
      data: {
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
          lastLoginAt: user.lastLoginAt?.toISOString(),
          createdAt: user.createdAt.toISOString(),
        },
      },
    }
  } catch (error: any) {
    console.error('刷新令牌失败:', error)

    // 如果是已知错误，直接抛出
    if (error.statusCode) {
      throw error
    }

    // 未知错误
    throw createError({
      statusCode: 500,
      statusMessage: '刷新令牌失败，请重新登录',
    })
  }
})

