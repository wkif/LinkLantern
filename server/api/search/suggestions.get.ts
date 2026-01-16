/**
 * 搜索建议 API
 * 代理各个搜索引擎的搜索建议请求
 */

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { q, engine = 'google' } = query

    if (!q || typeof q !== 'string') {
      return {
        success: false,
        message: '请提供搜索关键词',
        suggestions: [],
      }
    }

    let suggestions: string[] = []

    try {
      switch (engine) {
        case 'google':
          suggestions = await fetchGoogleSuggestions(q)
          break
        case 'bing':
          suggestions = await fetchBingSuggestions(q)
          break
        case 'baidu':
          suggestions = await fetchBaiduSuggestions(q)
          break
        case 'github':
          suggestions = await fetchGitHubSuggestions(q)
          break
        default:
          suggestions = []
      }
    } catch (err) {
      console.error(`获取 ${engine} 搜索建议失败:`, err)
      // 失败时返回空数组，不影响用户体验
      suggestions = []
    }

    return {
      success: true,
      engine,
      query: q,
      suggestions,
    }
  } catch (error: any) {
    console.error('搜索建议API错误:', error)
    return {
      success: false,
      message: '获取搜索建议失败',
      suggestions: [],
    }
  }
})

/**
 * 获取 Google 搜索建议
 */
async function fetchGoogleSuggestions(query: string): Promise<string[]> {
  try {
    // Google Suggest API
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`
    const response = await $fetch<any>(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    // Google 返回格式: [query, [suggestions]]
    if (Array.isArray(response) && Array.isArray(response[1])) {
      return response[1].slice(0, 8) // 最多返回8条
    }
    return []
  } catch (error) {
    console.error('Google 建议获取失败:', error)
    return []
  }
}

/**
 * 获取 Bing 搜索建议
 */
async function fetchBingSuggestions(query: string): Promise<string[]> {
  try {
    // Bing Suggest API
    const url = `https://api.bing.com/osjson.aspx?query=${encodeURIComponent(query)}`
    const response = await $fetch<any>(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    // Bing 返回格式: [query, [suggestions]]
    if (Array.isArray(response) && Array.isArray(response[1])) {
      return response[1].slice(0, 8)
    }
    return []
  } catch (error) {
    console.error('Bing 建议获取失败:', error)
    return []
  }
}

/**
 * 获取百度搜索建议
 */
async function fetchBaiduSuggestions(query: string): Promise<string[]> {
  try {
    // 百度 Suggest API
    const url = `https://suggestion.baidu.com/su?wd=${encodeURIComponent(query)}&cb=callback`
    const response = await $fetch<string>(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    // 百度返回 JSONP 格式，需要解析
    const match = response.match(/callback\((.*)\)/)
    if (match && match[1]) {
      const data = JSON.parse(match[1])
      if (data.s && Array.isArray(data.s)) {
        return data.s.slice(0, 8)
      }
    }
    return []
  } catch (error) {
    console.error('百度建议获取失败:', error)
    return []
  }
}

/**
 * 获取 GitHub 搜索建议
 */
async function fetchGitHubSuggestions(query: string): Promise<string[]> {
  try {
    // GitHub Search API
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=8`
    const response = await $fetch<any>(url, {
      headers: {
        'User-Agent': 'LinkLantern',
        'Accept': 'application/vnd.github.v3+json',
      },
    })

    if (response.items && Array.isArray(response.items)) {
      return response.items.map((item: any) => item.full_name)
    }
    return []
  } catch (error) {
    console.error('GitHub 建议获取失败:', error)
    return []
  }
}

