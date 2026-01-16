/**
 * 导入链接数据
 * POST /api/links/import
 * 
 * 需要认证
 * 
 * 请求体：
 * {
 *   links: Array<{
 *     url: string
 *     title: string
 *     description?: string
 *     icon?: string
 *     category?: string
 *     isPublic?: boolean
 *   }>
 *   mode: 'append' | 'replace'  // append: 追加模式，replace: 替换模式
 * }
 * 
 * 返回：
 * {
 *   success: true,
 *   data: {
 *     imported: number,     // 成功导入的数量
 *     skipped: number,      // 跳过的数量（重复）
 *     failed: number,       // 失败的数量
 *     deleted?: number,     // 替换模式下删除的数量
 *   }
 * }
 */

import prisma from '../../utils/prisma'
import { requireAuth } from '../../utils/auth-middleware'

export default defineEventHandler(async (event) => {
  try {
    // 验证用户身份
    const user = await requireAuth(event)
    
    // 获取请求体
    const body = await readBody(event)
    const { links, mode = 'append' } = body
    
    // 验证数据
    if (!Array.isArray(links)) {
      throw createError({
        statusCode: 400,
        statusMessage: '无效的数据格式：links 必须是数组',
      })
    }
    
    if (!['append', 'replace'].includes(mode)) {
      throw createError({
        statusCode: 400,
        statusMessage: '无效的导入模式：mode 必须是 append 或 replace',
      })
    }
    
    let imported = 0
    let skipped = 0
    let failed = 0
    let deleted = 0
    
    // 替换模式：先删除所有现有链接
    if (mode === 'replace') {
      const deleteResult = await prisma.link.deleteMany({
        where: {
          userId: user.userId,
        },
      })
      deleted = deleteResult.count
    }
    
    // 导入链接
    for (const link of links) {
      try {
        // 验证必填字段
        if (!link.url || !link.title) {
          failed++
          continue
        }
        
        // 在追加模式下，检查是否已存在相同 URL
        if (mode === 'append') {
          const existing = await prisma.link.findFirst({
            where: {
              userId: user.userId,
              url: link.url,
            },
          })
          
          if (existing) {
            skipped++
            continue
          }
        }
        
        // 创建链接
        await prisma.link.create({
          data: {
            url: link.url,
            title: link.title,
            description: link.description || null,
            icon: link.icon || null,
            category: link.category || null,
            isPublic: link.isPublic ?? false,
            clicks: 0, // 重置点击数
            userId: user.userId,
          },
        })
        
        imported++
      } catch (error) {
        console.error('导入单个链接失败:', error)
        failed++
      }
    }
    
    return {
      success: true,
      data: {
        imported,
        skipped,
        failed,
        ...(mode === 'replace' ? { deleted } : {}),
      },
      message: `导入完成：成功 ${imported} 个，跳过 ${skipped} 个，失败 ${failed} 个${mode === 'replace' ? `，删除 ${deleted} 个` : ''}`,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('导入链接数据错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '导入链接数据失败',
    })
  }
})

