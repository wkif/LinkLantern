/**
 * 获取公开链接推荐
 * GET /api/links/public
 * 
 * 返回所有用户设置为公开的链接
 * 
 * 查询参数：
 * - sort?: 'popular' | 'recent' - 排序方式（按点击量或时间）
 * - limit?: number - 返回数量限制
 * - category?: string - 分类筛选
 */

import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const sort = (query.sort as string) || 'popular'
    const limit = parseInt(query.limit as string) || 20
    const category = query.category as string | undefined

    // 构建查询条件
    const where: any = {
      isPublic: true, // 只返回公开的链接
    }

    if (category) {
      where.category = category
    }

    // 构建排序条件
    let orderBy: any
    if (sort === 'popular') {
      // 按点击量排序
      orderBy = { clicks: 'desc' }
    } else {
      // 按创建时间排序
      orderBy = { createdAt: 'desc' }
    }

    // 查询公开链接
    const links = await prisma.link.findMany({
      where,
      orderBy,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // 格式化返回数据，隐藏完整邮箱
    const formattedLinks = links.map(link => ({
      id: link.id,
      url: link.url,
      title: link.title,
      description: link.description,
      icon: link.icon,
      category: link.category,
      clicks: link.clicks,
      createdAt: link.createdAt,
      updatedAt: link.updatedAt,
      // 分享者信息（隐私保护）
      sharedBy: {
        id: link.user.id,
        name: link.user.name || '匿名用户',
        // 隐藏邮箱的中间部分
        email: link.user.email ? maskEmail(link.user.email) : '',
      },
    }))

    return {
      success: true,
      data: formattedLinks,
      total: formattedLinks.length,
      sort,
    }
  } catch (error: any) {
    console.error('获取公开链接错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '获取推荐链接失败',
    })
  }
})

/**
 * 隐藏邮箱中间部分
 * example@gmail.com -> e****e@gmail.com
 */
function maskEmail(email: string): string {
  const [username, domain] = email.split('@')
  if (username.length <= 2) {
    return `${username[0]}****@${domain}`
  }
  const firstChar = username[0]
  const lastChar = username[username.length - 1]
  return `${firstChar}****${lastChar}@${domain}`
}

