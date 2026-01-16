/**
 * 获取用户的链接分类统计
 * GET /api/links/stats
 * 
 * 需要认证
 */

import prisma from '../../utils/prisma'
import { requireAuth } from '../../utils/auth-middleware'

export default defineEventHandler(async (event) => {
  try {
    // 验证用户身份
    const user = await requireAuth(event)
    
    // 获取总数
    const total = await prisma.link.count({
      where: { userId: user.userId },
    })
    
    // 获取分类统计
    const links = await prisma.link.findMany({
      where: { userId: user.userId },
      select: {
        category: true,
      },
    })
    
    // 统计每个分类的数量
    const categoryStats: Record<string, number> = {}
    links.forEach(link => {
      const cat = link.category || '未分类'
      categoryStats[cat] = (categoryStats[cat] || 0) + 1
    })
    
    // 获取总点击数
    const clicksResult = await prisma.link.aggregate({
      where: { userId: user.userId },
      _sum: {
        clicks: true,
      },
    })
    
    return {
      success: true,
      data: {
        total,
        totalClicks: clicksResult._sum.clicks || 0,
        categories: categoryStats,
      },
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('获取统计信息错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '获取统计信息失败',
    })
  }
})

