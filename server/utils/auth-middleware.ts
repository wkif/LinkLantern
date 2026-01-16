/**
 * 认证中间件
 * 验证 JWT 令牌并将用户信息附加到事件上下文
 */

import { H3Event } from 'h3'
import prisma from '../utils/prisma'
import { extractToken, verifyAccessToken } from '../utils/auth'

/**
 * 扩展 H3Event 类型以包含用户信息
 */
declare module 'h3' {
  interface H3EventContext {
    user?: {
      userId: number
      email: string
    }
  }
}

/**
 * 认证中间件 - 要求用户必须登录
 * 使用方式：在 API 中调用 await requireAuth(event)
 */
export async function requireAuth(event: H3Event) {
  const authHeader = getHeader(event, 'authorization')
  const token = extractToken(authHeader)
  
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: '未提供认证令牌',
    })
  }
  
  const payload = verifyAccessToken(token)
  
  if (!payload) {
    throw createError({
      statusCode: 401,
      statusMessage: '令牌无效或已过期',
    })
  }
  
  // 验证用户是否存在且账户激活
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      isActive: true,
    },
  })
  
  if (!user || !user.isActive) {
    throw createError({
      statusCode: 401,
      statusMessage: '用户不存在或账户已禁用',
    })
  }
  
  // 将用户信息附加到事件上下文
  event.context.user = {
    userId: user.id,
    email: user.email,
  }
  
  return event.context.user
}

/**
 * 可选认证中间件 - 用户可以登录也可以不登录
 * 如果提供了有效令牌，则附加用户信息
 */
export async function optionalAuth(event: H3Event) {
  const authHeader = getHeader(event, 'authorization')
  const token = extractToken(authHeader)
  
  if (!token) {
    return null
  }
  
  const payload = verifyAccessToken(token)
  
  if (!payload) {
    return null
  }
  
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      isActive: true,
    },
  })
  
  if (!user || !user.isActive) {
    return null
  }
  
  event.context.user = {
    userId: user.id,
    email: user.email,
  }
  
  return event.context.user
}

