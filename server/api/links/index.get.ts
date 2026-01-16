/**
 * 获取当前用户的所有链接
 * GET /api/links
 * 
 * 需要认证
 * 
 * 查询参数：
 * - category?: string - 按分类筛选
 * - search?: string - 搜索标题或描述
 * - page?: number - 当前页码（从1开始）
 * - pageSize?: number - 每页条数（默认10）
 * - sortBy?: string - 排序字段（createdAt, clicks, title）
 * - sortOrder?: string - 排序方向（asc, desc）
 * - all?: boolean - 是否获取全部数据（不分页，用于首页和管理后台概览）
 */

import prisma from '../../utils/prisma'
import { requireAuth } from '../../utils/auth-middleware'

export default defineEventHandler(async (event) => {
  try {
    // 验证用户身份
    const user = await requireAuth(event)
    
    // 获取查询参数
    const query = getQuery(event)
    const category = query.category as string | undefined
    const search = query.search as string | undefined
    const page = parseInt(query.page as string) || 1
    const pageSize = parseInt(query.pageSize as string) || 10
    const sortBy = (query.sortBy as string) || 'createdAt'
    const sortOrder = (query.sortOrder as string) || 'desc'
    const all = query.all === 'true' // 是否获取全部数据
    
    // 构建查询条件
    const where: any = {
      userId: user.userId,
    }
    
    if (category) {
      where.category = category
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }
    
    // 构建排序条件
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder
    
    // 如果请求全部数据（不分页）
    if (all) {
      const links = await prisma.link.findMany({
        where,
        orderBy,
      })
      
      return {
        success: true,
        data: links,
      }
    }
    
    // 分页查询
    const skip = (page - 1) * pageSize
    const take = pageSize
    
    // 查询链接总数
    const total = await prisma.link.count({ where })
    
    // 查询链接
    const links = await prisma.link.findMany({
      where,
      orderBy,
      skip,
      take,
    })
    
    return {
      success: true,
      data: links,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('获取链接列表错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '获取链接列表失败',
    })
  }
})

