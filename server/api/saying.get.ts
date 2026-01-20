/**
 * 获取一言 API
 * GET /api/saying
 * 
 * 功能：从 UapiPro 获取随机的诗词、名言或动漫台词
 * 
 * 响应：
 * {
 *   success: boolean,
 *   data: {
 *     text: string  // 一言内容
 *   }
 * }
 */

export default defineEventHandler(async (event) => {
  try {
    // 调用 UapiPro 一言接口
    const response = await $fetch<{ text: string }>('https://uapis.cn/api/v1/saying', {
      method: 'GET',
      // 设置超时时间
      timeout: 5000,
    })

    if (!response || !response.text) {
      throw createError({
        statusCode: 500,
        statusMessage: '获取一言失败：响应数据格式错误',
      })
    }

    return {
      success: true,
      data: {
        text: response.text,
      },
    }
  } catch (error: any) {
    console.error('获取一言失败:', error)
    
    // 如果是已经创建的错误，直接抛出
    if (error.statusCode) {
      throw error
    }
    
    // 其他错误
    throw createError({
      statusCode: 500,
      statusMessage: '获取一言失败，请稍后重试',
    })
  }
})

