/**
 * 从浏览器书签导入链接
 * POST /api/links/import-bookmarks
 * 
 * 请求体：
 * {
 *   bookmarks: Array<{ url, title, category?, icon? }>,  // 前端已解析的书签数组
 *   mode: 'append' | 'replace'  // 追加或替换
 * }
 */

import prisma from '../../utils/prisma'
import { requireAuth } from '../../utils/auth-middleware'

// 从URL自动获取favicon
async function fetchFavicon(url: string): Promise<string | null> {
  try {
    const urlObj = new URL(url)
    const faviconUrl = `${urlObj.protocol}//${urlObj.host}/favicon.ico`
    return faviconUrl
  } catch {
    return null
  }
}

export default defineEventHandler(async (event) => {
  try {
    // 认证检查
    const user = await requireAuth(event)

    const body = await readBody(event)
    const { bookmarks, mode = 'append' } = body

    // 验证参数
    if (!bookmarks || !Array.isArray(bookmarks) || bookmarks.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '请提供书签数据',
      })
    }

    if (!['append', 'replace'].includes(mode)) {
      throw createError({
        statusCode: 400,
        statusMessage: '导入模式必须是 append 或 replace',
      })
    }

    console.log(`[Import Bookmarks] 接收到 ${bookmarks.length} 个书签`)

    // 如果是替换模式，先删除所有现有链接
    if (mode === 'replace') {
      console.log('[Import Bookmarks] 替换模式：删除现有链接...')
      await prisma.link.deleteMany({
        where: { userId: user.userId },
      })
    }

    // 获取现有链接（用于去重）
    const existingLinks = await prisma.link.findMany({
      where: { userId: user.userId },
      select: { url: true },
    })
    const existingUrls = new Set(existingLinks.map(link => link.url))

    // 批量导入书签
    let imported = 0
    let skipped = 0

    for (const bookmark of bookmarks) {
      try {
        // 检查URL是否已存在（仅在追加模式下）
        if (mode === 'append' && existingUrls.has(bookmark.url)) {
          skipped++
          continue
        }

        // 处理图标
        let icon = bookmark.icon
        // 如果图标是 base64 且过大（>50KB），则使用 favicon URL
        if (icon && icon.startsWith('data:') && icon.length > 50000) {
          console.log(`[Import Bookmarks] Base64 图标过大 (${icon.length} 字符)，使用 favicon`)
          icon = await fetchFavicon(bookmark.url) || undefined
        }

        // 创建链接
        await prisma.link.create({
          data: {
            url: bookmark.url,
            title: bookmark.title,
            category: bookmark.category,
            icon,
            isPublic: false, // 默认私密
            userId: user.userId,
          },
        })

        imported++
      } catch (error) {
        console.error(`[Import Bookmarks] 导入失败: ${bookmark.url}`, error)
        skipped++
      }
    }

    console.log(`[Import Bookmarks] 完成：导入 ${imported} 个，跳过 ${skipped} 个`)

    return {
      success: true,
      message: `成功导入 ${imported} 个书签${skipped > 0 ? `，跳过 ${skipped} 个重复项` : ''}`,
      data: {
        imported,
        skipped,
        total: bookmarks.length,
      },
    }
  } catch (error: any) {
    console.error('[Import Bookmarks] 错误:', error)

    // 如果是已经创建的错误，直接抛出
    if (error.statusCode) {
      throw error
    }

    // 其他错误
    throw createError({
      statusCode: 500,
      statusMessage: error.message || '导入书签失败',
    })
  }
})
