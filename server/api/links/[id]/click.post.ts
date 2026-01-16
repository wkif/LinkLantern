/**
 * 增加链接点击次数
 * POST /api/links/:id/click
 * 
 * 需要认证，只能点击自己的链接
 */

import prisma from '../../../utils/prisma'
import { requireAuth } from '../../../utils/auth-middleware'

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
    
    // 检查链接是否存在且属于当前用户
    const existingLink = await prisma.link.findUnique({
      where: { id: Number(id) },
    })
    
    if (!existingLink) {
      throw createError({
        statusCode: 404,
        statusMessage: '链接不存在',
      })
    }
    
    if (existingLink.userId !== user.userId) {
      throw createError({
        statusCode: 403,
        statusMessage: '没有权限访问此链接',
      })
    }
    
    // 增加点击次数
    const link = await prisma.link.update({
      where: { id: Number(id) },
      data: {
        clicks: {
          increment: 1,
        },
      },
    })
    
    return {
      success: true,
      data: {
        clicks: link.clicks,
      },
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('更新点击次数错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '更新点击次数失败',
    })
  }
})

