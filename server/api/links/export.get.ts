/**
 * 导出当前用户的所有链接数据
 * GET /api/links/export
 * 
 * 需要认证
 * 
 * 返回所有链接的 JSON 数据（不包含敏感信息如 userId、id）
 */

import prisma from '../../utils/prisma'
import { requireAuth } from '../../utils/auth-middleware'

export default defineEventHandler(async (event) => {
  try {
    // 验证用户身份
    const user = await requireAuth(event)
    
    // 获取该用户的所有链接（不分页）
    const links = await prisma.link.findMany({
      where: {
        userId: user.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        url: true,
        title: true,
        description: true,
        icon: true,
        category: true,
        isPublic: true,
        clicks: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    
    // 构建导出数据
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      totalLinks: links.length,
      links: links,
    }
    
    return {
      success: true,
      data: exportData,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('导出链接数据错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '导出链接数据失败',
    })
  }
})

