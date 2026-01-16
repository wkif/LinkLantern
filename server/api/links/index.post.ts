/**
 * 创建新链接
 * POST /api/links
 * 
 * 需要认证
 * 
 * 请求体：
 * {
 *   url: string,
 *   title: string,
 *   description?: string,
 *   icon?: string,
 *   category?: string,
 *   isPublic?: boolean
 * }
 */

import prisma from '../../utils/prisma'
import { requireAuth } from '../../utils/auth-middleware'

export default defineEventHandler(async (event) => {
  try {
    // 验证用户身份
    const user = await requireAuth(event)
    
    const body = await readBody(event)
    const { url, title, description, icon, category, isPublic } = body
    
    // 验证必填字段
    if (!url || !title) {
      throw createError({
        statusCode: 400,
        statusMessage: 'URL 和标题为必填项',
      })
    }
    
    // 验证 URL 格式
    try {
      new URL(url)
    } catch {
      throw createError({
        statusCode: 400,
        statusMessage: 'URL 格式不正确',
      })
    }
    
    // 创建链接
    const link = await prisma.link.create({
      data: {
        url,
        title,
        description: description || null,
        icon: icon || null,
        category: category || null,
        isPublic: isPublic || false,
        userId: user.userId,
      },
    })
    
    return {
      success: true,
      message: '链接创建成功',
      data: link,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('创建链接错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '创建链接失败',
    })
  }
})

