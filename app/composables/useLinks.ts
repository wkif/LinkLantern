/**
 * 链接管理 Composable
 * 处理链接的增删改查操作
 */

export interface Link {
  id: number
  url: string
  title: string
  description?: string
  icon?: string
  category?: string
  isPublic: boolean
  clicks: number
  userId: number
  createdAt: string
  updatedAt: string
}

export interface PublicLink extends Link {
  sharedBy: {
    id: number
    name: string
    email: string
  }
}

export interface PaginationInfo {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export const useLinks = () => {
  const { accessToken } = useAuth()
  
  // 链接列表
  const links = ref<Link[]>([])
  const publicLinks = ref<PublicLink[]>([])
  const pagination = ref<PaginationInfo>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  })
  const loading = ref(false)
  const loadingPublic = ref(false)
  const error = ref<string | null>(null)

  /**
   * 获取链接列表
   */
  const fetchLinks = async (params?: { 
    category?: string
    search?: string
    page?: number
    pageSize?: number
    sortBy?: 'createdAt' | 'clicks' | 'title'
    sortOrder?: 'asc' | 'desc'
  }) => {
    if (!accessToken.value) {
      links.value = []
      return
    }

    loading.value = true
    error.value = null

    try {
      const query = new URLSearchParams()
      if (params?.category) query.append('category', params.category)
      if (params?.search) query.append('search', params.search)
      if (params?.page) query.append('page', params.page.toString())
      if (params?.pageSize) query.append('pageSize', params.pageSize.toString())
      if (params?.sortBy) query.append('sortBy', params.sortBy)
      if (params?.sortOrder) query.append('sortOrder', params.sortOrder)

      const response = await $fetch<any>(`/api/links?${query}`, {
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      })

      if (response.success) {
        links.value = response.data
        if (response.pagination) {
          pagination.value = response.pagination
        }
      }
    } catch (err: any) {
      console.error('获取链接失败:', err)
      error.value = err.data?.statusMessage || '获取链接失败'
      links.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建链接
   */
  const createLink = async (data: {
    url: string
    title: string
    description?: string
    icon?: string
    category?: string
    isPublic?: boolean
  }) => {
    if (!accessToken.value) return { success: false, message: '请先登录' }

    loading.value = true
    try {
      const response = await $fetch<any>('/api/links', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
        body: data,
      })

      if (response.success) {
        return { success: true, message: '链接创建成功' }
      }
    } catch (err: any) {
      return {
        success: false,
        message: err.data?.statusMessage || '创建失败',
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新链接
   */
  const updateLink = async (id: number, data: Partial<Link>) => {
    if (!accessToken.value) return { success: false, message: '请先登录' }

    loading.value = true
    try {
      const response = await $fetch<any>(`/api/links/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
        body: data,
      })

      if (response.success) {
        return { success: true, message: '链接更新成功' }
      }
    } catch (err: any) {
      return {
        success: false,
        message: err.data?.statusMessage || '更新失败',
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除链接
   */
  const deleteLink = async (id: number) => {
    if (!accessToken.value) return { success: false, message: '请先登录' }

    loading.value = true
    try {
      const response = await $fetch<any>(`/api/links/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      })

      if (response.success) {
        return { success: true, message: '链接删除成功' }
      }
    } catch (err: any) {
      return {
        success: false,
        message: err.data?.statusMessage || '删除失败',
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 记录链接点击
   */
  const recordClick = async (id: number) => {
    if (!accessToken.value) return

    try {
      await $fetch(`/api/links/${id}/click`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      })
    } catch (err) {
      console.error('记录点击失败:', err)
    }
  }

  /**
   * 获取分类列表
   */
  const categories = computed(() => {
    const cats = new Set<string>()
    links.value.forEach(link => {
      if (link.category) cats.add(link.category)
    })
    return Array.from(cats).sort()
  })

  /**
   * 获取公开链接推荐
   */
  const fetchPublicLinks = async (params?: { 
    sort?: 'popular' | 'recent'
    limit?: number
    category?: string
  }) => {
    loadingPublic.value = true

    try {
      const query = new URLSearchParams()
      if (params?.sort) query.append('sort', params.sort)
      if (params?.limit) query.append('limit', params.limit.toString())
      if (params?.category) query.append('category', params.category)

      const response = await $fetch<any>(`/api/links/public?${query}`)

      if (response.success) {
        publicLinks.value = response.data
      }
    } catch (err: any) {
      console.error('获取公开链接失败:', err)
      publicLinks.value = []
    } finally {
      loadingPublic.value = false
    }
  }

  return {
    links: readonly(links),
    publicLinks: readonly(publicLinks),
    pagination: readonly(pagination),
    loading: readonly(loading),
    loadingPublic: readonly(loadingPublic),
    error: readonly(error),
    categories,
    fetchLinks,
    fetchPublicLinks,
    createLink,
    updateLink,
    deleteLink,
    recordClick,
  }
}

