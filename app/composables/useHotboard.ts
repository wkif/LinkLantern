/**
 * 热点榜 Composable
 * 管理各平台热榜数据的获取、缓存和状态
 */

export interface HotboardItem {
  title: string
  hot: number | string
  url: string
  mobileUrl?: string
}

/** 热榜条目 + 命中的屏蔽关键词（命中时 title 已替换为占位文案） */
export interface MaskedHotboardItem extends HotboardItem {
  blockedBy?: string
}

/** 热榜屏蔽占位文案 */
export const BLOCKED_PLACEHOLDER = '已屏蔽相关信息'


interface BlockedKeywordsResponse {
  success: boolean
  data?: { keywords: string[] }
  message?: string
}


export interface HotboardData {
  list: HotboardItem[]
  type: string
  update_time: string
}

export interface HotboardPlatform {
  type: string
  name: string
  icon: string
  category: string
}

export const useHotboard = () => {
  // 登录令牌（setup 作用域捕获，供异步回调安全读取）
  const { accessToken } = useAuth()

  // 屏蔽关键词列表（登录用户共享，跨组件同步）
  const blockedKeywords = useState<string[]>('hotboard:blocked-keywords', () => [])
  const blockedKeywordsLoaded = useState<boolean>('hotboard:blocked-loaded', () => false)
  // 支持的热榜平台列表
  const platforms: HotboardPlatform[] = [
    // 视频/社区
    { type: 'bilibili', name: '哔哩哔哩', icon: 'i-mdi-youtube', category: 'video' },
    { type: 'weibo', name: '微博热搜', icon: 'i-mdi-post', category: 'social' },
    { type: 'zhihu', name: '知乎热榜', icon: 'i-mdi-lightbulb', category: 'social' },
    { type: 'douyin', name: '抖音热榜', icon: 'i-mdi-music-note', category: 'video' },
    
    // 新闻/资讯
    { type: 'baidu', name: '百度热搜', icon: 'i-mdi-magnify', category: 'news' },
    { type: 'toutiao', name: '今日头条', icon: 'i-mdi-newspaper', category: 'news' },
    { type: 'thepaper', name: '澎湃新闻', icon: 'i-mdi-newspaper-variant', category: 'news' },
    
    // 技术/IT
    { type: 'juejin', name: '掘金热榜', icon: 'i-mdi-code-tags', category: 'tech' },
    { type: 'csdn', name: 'CSDN', icon: 'i-mdi-code-braces', category: 'tech' },
    { type: 'v2ex', name: 'V2EX', icon: 'i-mdi-forum', category: 'tech' },
    { type: 'ithome', name: 'IT之家', icon: 'i-mdi-laptop', category: 'tech' },
    { type: 'hellogithub', name: 'HelloGitHub', icon: 'i-mdi-github', category: 'tech' },
    
    // 其他
    { type: 'douban-movie', name: '豆瓣电影', icon: 'i-mdi-movie', category: 'entertainment' },
    { type: 'weread', name: '微信读书', icon: 'i-mdi-book-open', category: 'entertainment' },
  ]

  /**
   * 从服务端加载屏蔽关键词（已登录时调用；未登录保持空列表）
   */
  const fetchBlockedKeywords = async (): Promise<void> => {
    if (!accessToken.value) return
    try {
      const res = await $fetch<BlockedKeywordsResponse>('/api/auth/blocked-keywords', {
        headers: { Authorization: `Bearer ${accessToken.value}` },
      })
      if (res.success && res.data) {
        blockedKeywords.value = res.data.keywords
        blockedKeywordsLoaded.value = true
      }
    } catch (error) {
      console.error('[Hotboard] 加载屏蔽关键词失败:', error)
    }
  }

  /**
   * 全量保存屏蔽关键词到服务端
   */
  const saveBlockedKeywords = async (keywords: string[]): Promise<{ success: boolean; message?: string }> => {
    if (!accessToken.value) {
      return { success: false, message: '请先登录' }
    }
    try {
      const res = await $fetch<BlockedKeywordsResponse>('/api/auth/blocked-keywords', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${accessToken.value}` },
        body: { keywords },
      })
      if (res.success) {
        blockedKeywords.value = res.data?.keywords ?? keywords
        blockedKeywordsLoaded.value = true
        return { success: true, message: res.message }
      }
      return { success: false, message: res.message }
    } catch (error: unknown) {
      const message = error && typeof error === 'object' && 'data' in error
        ? (error.data as { statusMessage?: string } | undefined)?.statusMessage
        : undefined
      return { success: false, message: message || '保存失败，请稍后重试' }
    }
  }

  /**
   * 将热榜条目标记屏蔽：命中关键词的条目 title 替换为占位文案
   */
  const maskItems = (items: HotboardItem[]): MaskedHotboardItem[] => {
    const keywords = blockedKeywords.value
    if (keywords.length === 0) return items
    return items.map((item) => {
      const hit = keywords.find(k => item.title.includes(k))
      return hit ? { ...item, title: BLOCKED_PLACEHOLDER, blockedBy: hit } : item
    })
  }

  // 当前激活的平台列表（用户可以自定义）
  const activePlatforms = useState<string[]>('hotboard:active', () => {
    if (process.client) {
      const stored = localStorage.getItem('hotboard_platforms')
      if (stored) {
        return JSON.parse(stored)
      }
    }
    // 默认激活所有平台
    return platforms.map(p => p.type)
  })

  // 热榜数据缓存
  const hotboardCache = useState<Record<string, { data: HotboardData; timestamp: number }>>('hotboard:cache', () => ({}))

  // 加载状态
  const loading = ref<Record<string, boolean>>({})

  /**
   * 获取指定平台的热榜数据
   */
  const fetchHotboard = async (type: string): Promise<HotboardData | null> => {
    // 检查缓存（10分钟有效期）
    const cached = hotboardCache.value[type]
    const tenMinutes = 10 * 60 * 1000
    
    if (cached && Date.now() - cached.timestamp < tenMinutes) {
      return cached.data
    }

    // 开始加载
    loading.value[type] = true

    try {
      const response = await $fetch<any>('/api/hotboard', {
        params: { type },
      })

      if (response.success && response.data) {
        // 缓存数据
        hotboardCache.value[type] = {
          data: response.data,
          timestamp: Date.now(),
        }
        return response.data
      }
      return null
    } catch (error) {
      console.error(`获取${type}热榜失败:`, error)
      return null
    } finally {
      loading.value[type] = false
    }
  }

  /**
   * 批量获取多个平台的热榜
   */
  const fetchMultipleHotboards = async (types: string[]) => {
    const promises = types.map(type => fetchHotboard(type))
    return await Promise.all(promises)
  }

  /**
   * 设置激活的平台列表
   */
  const setActivePlatforms = (types: string[]) => {
    activePlatforms.value = types
    if (process.client) {
      localStorage.setItem('hotboard_platforms', JSON.stringify(types))
    }
  }

  /**
   * 添加平台到激活列表
   */
  const addPlatform = (type: string) => {
    if (!activePlatforms.value.includes(type)) {
      activePlatforms.value.push(type)
      if (process.client) {
        localStorage.setItem('hotboard_platforms', JSON.stringify(activePlatforms.value))
      }
    }
  }

  /**
   * 从激活列表移除平台
   */
  const removePlatform = (type: string) => {
    activePlatforms.value = activePlatforms.value.filter(t => t !== type)
    if (process.client) {
      localStorage.setItem('hotboard_platforms', JSON.stringify(activePlatforms.value))
    }
  }

  /**
   * 获取平台信息
   */
  const getPlatformInfo = (type: string): HotboardPlatform | undefined => {
    return platforms.find(p => p.type === type)
  }

  /**
   * 按分类获取平台列表
   */
  const getPlatformsByCategory = (category: string): HotboardPlatform[] => {
    return platforms.filter(p => p.category === category)
  }

  return {
    platforms,
    activePlatforms: readonly(activePlatforms),
    hotboardCache: readonly(hotboardCache),
    loading: readonly(loading),
    blockedKeywords: readonly(blockedKeywords),
    fetchBlockedKeywords,
    saveBlockedKeywords,
    maskItems,
    fetchHotboard,
    fetchMultipleHotboards,
    setActivePlatforms,
    addPlatform,
    removePlatform,
    getPlatformInfo,
    getPlatformsByCategory,
  }
}

