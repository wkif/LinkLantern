/**
 * 认证工具函数
 * 包含密码加密、JWT 生成和验证等功能
 */

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// JWT 密钥配置
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'         // 访问令牌有效期：1小时
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'  // 刷新令牌有效期：7天

/**
 * 密码加密
 * @param password 明文密码
 * @returns 加密后的密码
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

/**
 * 验证密码
 * @param password 明文密码
 * @param hashedPassword 加密后的密码
 * @returns 是否匹配
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

/**
 * JWT 载荷类型
 */
export interface JWTPayload {
  userId: number
  email: string
}

/**
 * 生成访问令牌（Access Token）
 * @param payload 用户信息
 * @returns JWT 令牌
 */
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

/**
 * 生成刷新令牌（Refresh Token）
 * @param payload 用户信息
 * @returns JWT 刷新令牌
 */
export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  })
}

/**
 * 验证访问令牌
 * @param token JWT 令牌
 * @returns 解码后的载荷或 null
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

/**
 * 验证刷新令牌
 * @param token JWT 刷新令牌
 * @returns 解码后的载荷或 null
 */
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

/**
 * 从请求头中提取 JWT 令牌
 * @param authHeader Authorization 请求头
 * @returns JWT 令牌或 null
 */
export function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null
  
  // 支持 "Bearer token" 格式
  const parts = authHeader.split(' ')
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1]
  }
  
  // 直接返回令牌
  return authHeader
}

/**
 * 验证邮箱格式
 * @param email 邮箱地址
 * @returns 是否有效
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证密码强度
 * @param password 密码
 * @returns { valid: boolean, message?: string }
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 6) {
    return { valid: false, message: '密码长度至少为 6 个字符' }
  }
  
  if (password.length > 100) {
    return { valid: false, message: '密码长度不能超过 100 个字符' }
  }
  
  // 可以添加更多密码规则，比如必须包含数字、大写字母等
  // const hasNumber = /\d/.test(password)
  // const hasUpperCase = /[A-Z]/.test(password)
  // if (!hasNumber || !hasUpperCase) {
  //   return { valid: false, message: '密码必须包含数字和大写字母' }
  // }
  
  return { valid: true }
}

