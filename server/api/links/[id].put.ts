/**
 * 更新链接
 * PUT /api/links/:id
 * 
 * 需要认证，只能更新自己的链接
 * 
 * 请求体：
 * {
 *   url?: string,
 *   title?: string,
 *   description?: string,
 *   icon?: string,
 *   category?: string,
 *   isPublic?: boolean
 * }
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
        statusMessage: '没有权限修改此链接',
      })
    }
    
    const body = await readBody(event)
    const { url, title, description, icon, category, isPublic } = body
    
    // 构建更新数据
    const updateData: any = {}
    
    if (url !== undefined) {
      // 验证 URL 格式
      try {
        new URL(url)
        updateData.url = url
      } catch {
        throw createError({
          statusCode: 400,
          statusMessage: 'URL 格式不正确',
        })
      }
    }
    
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (icon !== undefined) updateData.icon = icon
    if (category !== undefined) updateData.category = category
    if (isPublic !== undefined) updateData.isPublic = isPublic
    
    // 如果没有要更新的数据
    if (Object.keys(updateData).length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: '没有要更新的数据',
      })
    }
    
    // 更新链接
    const link = await prisma.link.update({
      where: { id: Number(id) },
      data: updateData,
    })
    
    return {
      success: true,
      message: '链接更新成功',
      data: link,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('更新链接错误:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '更新链接失败',
    })
  }
})

