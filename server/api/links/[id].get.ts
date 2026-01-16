/**
 * 获取单个链接详情
 * GET /api/links/:id
 * 
 * 需要认证，只能查看自己的链接
 */

import prisma from '../../utils/prisma'
import { requireAuth } from '../../utils/auth-middleware'

export default defineEventHandler(async (event) => {
  try {
    // 验证用户身份
    const user = await requireAuth(event)
    
    // 获取链接 ID
    const id = getRouterParam(event, 'id')
    
    if (!id || isNaN(Number(id))) {
      throw createError({
        statusCode: 400,
        statusMessage: '无效的链接 ID',
      })
    }
    
    // 查询链接
    const link = await prisma.link.findUnique({
      where: { id: Number(id) },
    })
    
    if (!link) {
      throw createError({
        statusCode: 404,
        statusMessage: '链接不存在',
      })
    }
    
    // 检查权限
    if (link.userId !== user.userId) {
      throw createError({
        statusCode: 403,
        statusMessage: '没有权限访问此链接',
      })
    }
    
    return {
      success: true,
      data: link,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('获取链接详情错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '获取链接详情失败',
    })
  }
})

