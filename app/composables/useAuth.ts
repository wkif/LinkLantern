/**
 * 认证状态管理 Composable
 * 处理用户登录、注册、登出等操作
 */

import type { Ref } from 'vue'

// 用户信息类型
export interface User {
  id: number
  email: string
  name?: string
  avatar?: string
  isActive: boolean
  emailVerified: boolean
  lastLoginAt?: string
  createdAt: string
}

// 登录表单类型
export interface LoginForm {
  email: string
  password: string
}

// 注册表单类型
export interface RegisterForm {
  email: string
  password: string
  name?: string
}

export const useAuth = () => {
  // 用户信息（从 localStorage 恢复）
  const user = useState<User | null>('auth:user', () => {
    if (process.client) {
      const stored = localStorage.getItem('user')
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch (e) {
          console.error('[Auth] Failed to parse stored user:', e)
          localStorage.removeItem('user')
        }
      }
    }
    return null
  })

  // Token（从 localStorage 恢复）
  const accessToken = useState<string | null>('auth:token', () => {
    if (process.client) {
      return localStorage.getItem('accessToken')
    }
    return null
  })

  const refreshToken = useState<string | null>('auth:refreshToken', () => {
    if (process.client) {
      return localStorage.getItem('refreshToken')
    }
    return null
  })

  // 是否已登录
  const isLoggedIn = computed(() => {
    return !!accessToken.value && !!user.value
  })

  // 加载状态
  const loading = ref(false)

  /**
   * 用户登录
   */
  const login = async (form: LoginForm) => {
    loading.value = true
    try {
      const response = await $fetch<any>('/api/auth/login', {
        method: 'POST',
        body: form,
      })

      if (response.success) {
        // 保存 token
        accessToken.value = response.data.tokens.accessToken
        refreshToken.value = response.data.tokens.refreshToken
        localStorage.setItem('accessToken', response.data.tokens.accessToken)
        localStorage.setItem('refreshToken', response.data.tokens.refreshToken)

        // 保存用户信息
        user.value = response.data.user
        localStorage.setItem('user', JSON.stringify(response.data.user))

        return { success: true, message: '登录成功' }
      }
    } catch (error: any) {
      console.error('登录失败:', error)
      return {
        success: false,
        message: error.data?.statusMessage || error.message || '登录失败，请重试',
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 用户注册
   */
  const register = async (form: RegisterForm) => {
    loading.value = true
    try {
      const response = await $fetch<any>('/api/auth/register', {
        method: 'POST',
        body: form,
      })

      if (response.success) {
        // 保存 token
        accessToken.value = response.data.tokens.accessToken
        refreshToken.value = response.data.tokens.refreshToken
        localStorage.setItem('accessToken', response.data.tokens.accessToken)
        localStorage.setItem('refreshToken', response.data.tokens.refreshToken)

        // 保存用户信息
        user.value = response.data.user
        localStorage.setItem('user', JSON.stringify(response.data.user))

        return { success: true, message: '注册成功' }
      }
    } catch (error: any) {
      console.error('注册失败:', error)
      return {
        success: false,
        message: error.data?.statusMessage || error.message || '注册失败，请重试',
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 用户登出
   */
  const logout = () => {
    // 清除状态
    user.value = null
    accessToken.value = null
    refreshToken.value = null

    // 清除 localStorage
    if (process.client) {
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  }

  /**
   * 刷新访问令牌
   * 当 access token 过期时，使用 refresh token 获取新的 token
   */
  const refreshAccessToken = async (): Promise<boolean> => {
    // 尝试从 state 或 localStorage 获取 refresh token
    let token = refreshToken.value
    
    // 如果 state 中没有，但 localStorage 有（可能是初始化时机问题）
    if (!token && process.client) {
      token = localStorage.getItem('refreshToken')
      if (token) {
        console.log('[Auth] Refresh token not in state yet, using localStorage token')
        // 同步到 state
        refreshToken.value = token
      }
    }
    
    if (!token) {
      console.log('[Auth] No refresh token available')
      return false
    }

    try {
      console.log('[Auth] Refreshing access token...')
      const response = await $fetch<any>('/api/auth/refresh', {
        method: 'POST',
        body: {
          refreshToken: token,
        },
      })

      if (response.success) {
        // 保存新的 token
        accessToken.value = response.data.tokens.accessToken
        refreshToken.value = response.data.tokens.refreshToken
        if (process.client) {
          localStorage.setItem('accessToken', response.data.tokens.accessToken)
          localStorage.setItem('refreshToken', response.data.tokens.refreshToken)
        }

        // 更新用户信息
        user.value = response.data.user
        if (process.client) {
          localStorage.setItem('user', JSON.stringify(response.data.user))
        }

        console.log('[Auth] Token refreshed successfully')
        return true
      }
      return false
    } catch (error: any) {
      console.error('[Auth] Failed to refresh token:', error.statusCode || error.message)
      // Refresh token 也过期了，清除登录状态
      if (error.statusCode === 401) {
        console.log('[Auth] Refresh token expired, clearing auth state')
        logout()
      }
      return false
    }
  }

  /**
   * 获取当前用户信息（从服务器刷新）
   * 如果 access token 过期，会自动尝试刷新
   */
  const fetchCurrentUser = async () => {
    // 尝试从 state 或 localStorage 获取 token
    let token = accessToken.value
    
    // 如果 state 中没有，但 localStorage 有（可能是初始化时机问题）
    if (!token && process.client) {
      token = localStorage.getItem('accessToken')
      if (token) {
        console.log('[Auth] Token not in state yet, using localStorage token')
        // 同步到 state
        accessToken.value = token
      }
    }
    
    if (!token) {
      console.log('[Auth] No token available, skipping fetch')
      return
    }

    try {
      console.log('[Auth] Fetching current user...')
      const response = await $fetch<any>('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.success) {
        user.value = response.data
        if (process.client) {
          localStorage.setItem('user', JSON.stringify(response.data))
        }
        console.log('[Auth] User info refreshed:', response.data.email)
      }
    } catch (error: any) {
      console.error('[Auth] Failed to fetch user info:', error.statusCode || error.message)
      
      // 如果是 401 错误，尝试刷新 token
      if (error.statusCode === 401) {
        console.log('[Auth] Access token expired, attempting to refresh...')
        const refreshed = await refreshAccessToken()
        
        if (refreshed) {
          // Token 刷新成功，重试获取用户信息
          console.log('[Auth] Retrying fetch user after token refresh...')
          try {
            const retryResponse = await $fetch<any>('/api/auth/me', {
              headers: {
                Authorization: `Bearer ${accessToken.value}`,
              },
            })
            
            if (retryResponse.success) {
              user.value = retryResponse.data
              if (process.client) {
                localStorage.setItem('user', JSON.stringify(retryResponse.data))
              }
              console.log('[Auth] User info fetched after refresh:', retryResponse.data.email)
            }
          } catch (retryError) {
            console.error('[Auth] Failed to fetch user after refresh:', retryError)
            logout()
          }
        } else {
          // Token 刷新失败，已经在 refreshAccessToken 中清除了状态
          console.log('[Auth] Failed to refresh token, user logged out')
        }
      }
    }
  }

  /**
   * 更新用户信息
   */
  const updateProfile = async (data: { name?: string; avatar?: string }) => {
    if (!accessToken.value) return { success: false, message: '未登录' }

    loading.value = true
    try {
      const response = await $fetch<any>('/api/auth/me', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
        body: data,
      })

      if (response.success) {
        user.value = response.data
        localStorage.setItem('user', JSON.stringify(response.data))
        return { success: true, message: '更新成功' }
      }
    } catch (error: any) {
      console.error('更新失败:', error)
      return {
        success: false,
        message: error.data?.statusMessage || '更新失败',
      }
    } finally {
      loading.value = false
    }
  }

  return {
    // 状态
    user: readonly(user),
    accessToken: readonly(accessToken),
    refreshToken: readonly(refreshToken),
    isLoggedIn,
    loading: readonly(loading),

    // 方法
    login,
    register,
    logout,
    fetchCurrentUser,
    refreshUserInfo: fetchCurrentUser, // 别名
    refreshAccessToken,
    updateProfile,
  }
}

