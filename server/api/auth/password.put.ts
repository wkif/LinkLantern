/**
 * 修改密码
 * PUT /api/auth/password
 * 
 * 需要 JWT 认证
 * 
 * 请求体：
 * {
 *   currentPassword: string,
 *   newPassword: string
 * }
 */

import prisma from '../../utils/prisma'
import { requireAuth } from '../../utils/auth-middleware'
import { hashPassword, verifyPassword } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  // 认证检查
  const authResult = await requireAuth(event)
  if (!authResult.success) {
    throw createError({
      statusCode: 401,
      statusMessage: authResult.message,
    })
  }

  const userId = event.context.user.id

  try {
    const body = await readBody(event)
    const { currentPassword, newPassword } = body

    // 验证输入
    if (!currentPassword || !newPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: '当前密码和新密码不能为空',
      })
    }

    if (newPassword.length < 8) {
      throw createError({
        statusCode: 400,
        statusMessage: '新密码至少需要8个字符',
      })
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: '用户不存在',
      })
    }

    // 验证当前密码
    const isPasswordValid = await verifyPassword(currentPassword, user.password)
    if (!isPasswordValid) {
      throw createError({
        statusCode: 400,
        statusMessage: '当前密码不正确',
      })
    }

    // 加密新密码
    const hashedPassword = await hashPassword(newPassword)

    // 更新密码
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    return {
      success: true,
      message: '密码修改成功',
    }
  } catch (error: any) {
    console.error('修改密码错误:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: '修改密码失败',
    })
  }
})

