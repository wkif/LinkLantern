/**
 * 热点榜 API 代理
 * 代理请求到 uapis.cn 获取各平台热榜数据
 */

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const type = query.type as string

  // 验证 type 参数
  const validTypes = [
    'bilibili', 'acfun', 'weibo', 'zhihu', 'zhihu-daily', 'douyin', 'kuaishou',
    'douban-movie', 'douban-group', 'tieba', 'hupu', 'miyoushe', 'ngabbs',
    'v2ex', '52pojie', 'hostloc', 'coolapk', 'baidu', 'thepaper', 'toutiao',
    'qq-news', 'sina', 'sina-news', 'netease-news', 'huxiu', 'ifanr', 'sspai',
    'ithome', 'ithome-xijiayi', 'juejin', 'jianshu', 'guokr', '36kr', '51cto',
    'csdn', 'nodeseek', 'hellogithub', 'lol', 'genshin', 'honkai', 'starrail',
    'weread', 'weatheralarm', 'earthquake', 'history'
  ]

  if (!type || !validTypes.includes(type)) {
    throw createError({
      statusCode: 400,
      statusMessage: '无效的热榜类型',
      data: { validTypes }
    })
  }

  try {
    // 调用第三方 API
    const response = await $fetch<any>('https://uapis.cn/api/v1/misc/hotboard', {
      params: { type },
      timeout: 10000, // 10秒超时
    })

    return {
      success: true,
      data: response,
    }
  } catch (error: any) {
    console.error('获取热榜失败:', error)

    // 根据错误类型返回不同的错误信息
    if (error.statusCode === 502) {
      throw createError({
        statusCode: 502,
        statusMessage: '上游服务错误，请稍后重试',
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: '获取热榜失败',
    })
  }
})

