/**
 * 获取热门搜索关键词
 * 基于用户链接点击统计生成
 */

import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    // 查询点击量最高的公开链接
    const popularLinks = await prisma.link.findMany({
      where: {
        isPublic: true,
        clicks: {
          gt: 0, // 至少有1次点击
        },
      },
      select: {
        title: true,
        clicks: true,
        category: true,
      },
      orderBy: {
        clicks: 'desc',
      },
      take: 10, // 获取前10个
    })

    // 提取标题关键词
    let hotSearches: string[] = []

    // 如果有热门链接，使用链接标题
    if (popularLinks.length > 0) {
      hotSearches = popularLinks.map((link: { title: string }) => link.title)
    }

    // 如果热门链接不足，补充一些通用的热门搜索词
    if (hotSearches.length < 5) {
      const defaultSearches = [
        'Vue 3 教程',
        'Nuxt 4 文档',
        'TypeScript 学习',
        'Tailwind CSS',
        'GitHub 热门项目',
        'React 开发',
        'Node.js 最佳实践',
        '前端面试题',
        'JavaScript 进阶',
        'CSS 布局技巧',
      ]
      
      // 补充到5个
      const needed = 5 - hotSearches.length
      hotSearches = [
        ...hotSearches,
        ...defaultSearches.slice(0, needed),
      ]
    }

    // 只返回前5个
    const result = hotSearches.slice(0, 5)

    return {
      success: true,
      data: result,
    }
  } catch (error: any) {
    console.error('获取热门搜索失败:', error)
    
    // 降级方案：返回默认热门搜索
    return {
      success: true,
      data: [
        'Vue 3 教程',
        'Nuxt 4 文档',
        'TypeScript 学习',
        'Tailwind CSS',
        'GitHub 热门项目',
      ],
    }
  }
})

