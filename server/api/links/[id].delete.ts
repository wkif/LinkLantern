/**
 * 删除链接
 * DELETE /api/links/:id
 * 
 * 需要认证，只能删除自己的链接
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
        statusMessage: '没有权限删除此链接',
      })
    }
    
    // 删除链接
    await prisma.link.delete({
      where: { id: Number(id) },
    })
    
    return {
      success: true,
      message: '链接删除成功',
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('删除链接错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '删除链接失败',
    })
  }
})

