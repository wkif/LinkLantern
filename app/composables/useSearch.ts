/**
 * 搜索建议 Composable
 * 提供搜索历史记录和智能建议
 */

export interface SearchSuggestion {
  type: 'history' | 'link' | 'suggestion' | 'engine'
  text: string
  icon?: string
  url?: string
  category?: string
}

export const useSearch = () => {
  const HISTORY_KEY = 'search_history'
  const MAX_HISTORY = 10

  // 搜索历史
  const searchHistory = useState<string[]>('search:history', () => {
    if (process.client) {
      const stored = localStorage.getItem(HISTORY_KEY)
      return stored ? JSON.parse(stored) : []
    }
    return []
  })

  // 引擎建议缓存
  const engineSuggestionsCache = useState<Record<string, { suggestions: string[]; timestamp: number }>>('search:engine_cache', () => ({}))

  /**
   * 添加搜索历史
   */
  const addToHistory = (query: string) => {
    if (!query.trim()) return

    const history = searchHistory.value.filter(item => item !== query)
    history.unshift(query)
    
    // 只保留最近的 MAX_HISTORY 条
    if (history.length > MAX_HISTORY) {
      history.length = MAX_HISTORY
    }

    searchHistory.value = history
    
    if (process.client) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
    }
  }

  /**
   * 清除搜索历史
   */
  const clearHistory = () => {
    searchHistory.value = []
    if (process.client) {
      localStorage.removeItem(HISTORY_KEY)
    }
  }

  /**
   * 从历史记录中移除一项
   */
  const removeFromHistory = (query: string) => {
    searchHistory.value = searchHistory.value.filter(item => item !== query)
    if (process.client) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(searchHistory.value))
    }
  }

  /**
   * 获取搜索引擎建议
   * @param query 搜索关键词
   * @param engine 搜索引擎
   */
  const fetchEngineSuggestions = async (query: string, engine: string): Promise<string[]> => {
    if (!query.trim()) return []

    const cacheKey = `${engine}:${query}`
    const cached = engineSuggestionsCache.value[cacheKey]
    
    // 使用5分钟缓存
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return cached.suggestions
    }

    try {
      const response = await $fetch<any>('/api/search/suggestions', {
        params: { q: query, engine },
      })

      if (response.success && Array.isArray(response.suggestions)) {
        // 缓存结果
        engineSuggestionsCache.value[cacheKey] = {
          suggestions: response.suggestions,
          timestamp: Date.now(),
        }
        return response.suggestions
      }
      return []
    } catch (error) {
      console.error('获取搜索引擎建议失败:', error)
      return []
    }
  }

  /**
   * 获取搜索建议
   * @param query 搜索关键词
   * @param links 用户的链接列表
   * @param engine 当前搜索引擎
   * @param engineSuggestions 搜索引擎建议
   */
  const getSuggestions = (
    query: string, 
    links: any[] = [], 
    engine?: string,
    engineSuggestions: string[] = []
  ): SearchSuggestion[] => {
    if (!query.trim()) {
      // 无输入时，显示历史记录
      return searchHistory.value.map(text => ({
        type: 'history' as const,
        text,
        icon: 'i-mdi-history',
      }))
    }

    const suggestions: SearchSuggestion[] = []
    const lowerQuery = query.toLowerCase()

    // 1. 添加当前搜索建议
    suggestions.push({
      type: 'suggestion' as const,
      text: query,
      icon: 'i-mdi-magnify',
    })

    // 2. 搜索引擎建议（最多5条）
    const engineSuggestionsFiltered = engineSuggestions
      .filter(s => s.toLowerCase() !== lowerQuery) // 排除与输入相同的
      .slice(0, 5)
      .map(text => ({
        type: 'engine' as const,
        text,
        icon: getEngineIcon(engine),
      }))

    // 3. 匹配历史记录（最多3条）
    const matchedHistory = searchHistory.value
      .filter(item => item.toLowerCase().includes(lowerQuery) && item.toLowerCase() !== lowerQuery)
      .slice(0, 3)
      .map(text => ({
        type: 'history' as const,
        text,
        icon: 'i-mdi-history',
      }))

    // 4. 匹配用户的链接（最多5条）
    const matchedLinks = links
      .filter(link => 
        link.title.toLowerCase().includes(lowerQuery) ||
        (link.description && link.description.toLowerCase().includes(lowerQuery))
      )
      .slice(0, 5)
      .map(link => ({
        type: 'link' as const,
        text: link.title,
        icon: link.icon || 'i-mdi-link-variant',
        url: link.url,
        category: link.category,
      }))

    // 合并所有建议
    return [...suggestions, ...engineSuggestionsFiltered, ...matchedHistory, ...matchedLinks]
  }

  /**
   * 获取引擎图标
   */
  const getEngineIcon = (engine?: string): string => {
    switch (engine) {
      case 'google': return 'i-mdi-google'
      case 'bing': return 'i-mdi-microsoft-bing'
      case 'baidu': return 'i-mdi-web'
      case 'github': return 'i-mdi-github'
      default: return 'i-mdi-magnify'
    }
  }

  /**
   * 热门搜索（从 API 获取）
   */
  const hotSearches = useState<string[]>('search:hot', () => [])
  const loadingHotSearches = ref(false)

  /**
   * 获取热门搜索
   */
  const fetchHotSearches = async () => {
    // 如果已经有数据且是最近1小时内获取的，直接使用缓存
    const cacheKey = 'hot_searches_timestamp'
    const cachedTimestamp = process.client ? localStorage.getItem(cacheKey) : null
    const cachedData = process.client ? localStorage.getItem('hot_searches') : null
    
    if (cachedTimestamp && cachedData) {
      const timestamp = parseInt(cachedTimestamp)
      const oneHour = 60 * 60 * 1000
      if (Date.now() - timestamp < oneHour) {
        hotSearches.value = JSON.parse(cachedData)
        return
      }
    }

    loadingHotSearches.value = true
    try {
      const response = await $fetch<any>('/api/search/hot')
      
      if (response.success && Array.isArray(response.data)) {
        hotSearches.value = response.data
        
        // 缓存到 localStorage
        if (process.client) {
          localStorage.setItem('hot_searches', JSON.stringify(response.data))
          localStorage.setItem(cacheKey, Date.now().toString())
        }
      }
    } catch (error) {
      console.error('获取热门搜索失败:', error)
      // 使用默认值
      hotSearches.value = [
        'Vue 3 教程',
        'Nuxt 4 文档',
        'TypeScript 学习',
        'Tailwind CSS',
        'GitHub 热门项目',
      ]
    } finally {
      loadingHotSearches.value = false
    }
  }

  // 在客户端自动加载热门搜索
  if (process.client && hotSearches.value.length === 0) {
    fetchHotSearches()
  }

  return {
    searchHistory: readonly(searchHistory),
    hotSearches: readonly(hotSearches),
    loadingHotSearches: readonly(loadingHotSearches),
    addToHistory,
    clearHistory,
    removeFromHistory,
    getSuggestions,
    fetchEngineSuggestions,
    fetchHotSearches,
  }
}

