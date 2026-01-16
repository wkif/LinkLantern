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
    fetchHotboard,
    fetchMultipleHotboards,
    setActivePlatforms,
    addPlatform,
    removePlatform,
    getPlatformInfo,
    getPlatformsByCategory,
  }
}

