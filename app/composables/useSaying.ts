/**
 * 一言功能 Composable
 * 处理随机语录的获取和管理
 */

export const useSaying = () => {
  // 一言内容
  const saying = useState<string>('saying', () => '')
  
  // 加载状态
  const loading = useState<boolean>('saying:loading', () => false)

  /**
   * 获取一言
   */
  const fetchSaying = async (): Promise<void> => {
    loading.value = true
    try {
      const response = await $fetch<{ success: boolean; data: { text: string } }>('/api/saying')
      if (response.success && response.data?.text) {
        saying.value = response.data.text
      } else {
        saying.value = ''
      }
    } catch (error) {
      console.error('获取一言失败:', error)
      // 静默失败，不显示错误提示
      saying.value = ''
    } finally {
      loading.value = false
    }
  }

  /**
   * 清除一言
   */
  const clearSaying = () => {
    saying.value = ''
  }

  return {
    // 状态
    saying: readonly(saying),
    loading: readonly(loading),

    // 方法
    fetchSaying,
    clearSaying,
  }
}

