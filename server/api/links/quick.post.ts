/**
 * 浏览器扩展快捷收藏（使用 X-Bookmark-Token，无需 JWT）
 * POST /api/links/quick
 *
 * Headers: X-Bookmark-Token: <hex>
 * Body: { url, title, description?, icon?, category?, isPublic? }
 */

import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const token = getHeader(event, 'x-bookmark-token')
  if (!token?.trim()) {
    throw createError({
      statusCode: 401,
      statusMessage: '缺少 X-Bookmark-Token',
    })
  }

  const dbUser = await prisma.user.findFirst({
    where: { bookmarkToken: token.trim(), isActive: true },
    select: { id: true },
  })

  if (!dbUser) {
    throw createError({
      statusCode: 401,
      statusMessage: '令牌无效或已失效',
    })
  }

  const body = await readBody(event)
  const { url, title, description, icon, category, isPublic } = body || {}

  if (!url || !title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'URL 和标题为必填项',
    })
  }

  try {
    new URL(url)
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'URL 格式不正确',
    })
  }

  const existing = await prisma.link.findFirst({
    where: { userId: dbUser.id, url },
  })

  if (existing) {
    return {
      success: true,
      message: '该链接已在收藏中',
      data: { duplicate: true, link: existing },
    }
  }

  const link = await prisma.link.create({
    data: {
      url,
      title,
      description: description || null,
      icon: icon || null,
      category: category || null,
      isPublic: isPublic || false,
      userId: dbUser.id,
    },
  })

  return {
    success: true,
    message: '链接创建成功',
    data: { duplicate: false, link },
  }
})
