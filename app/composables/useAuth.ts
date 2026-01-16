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
      return stored ? JSON.parse(stored) : null
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

  // 在客户端启动时，确保从 localStorage 同步状态
  if (process.client && !user.value && !accessToken.value) {
    const storedToken = localStorage.getItem('accessToken')
    const storedUser = localStorage.getItem('user')
    const storedRefreshToken = localStorage.getItem('refreshToken')
    
    if (storedToken) {
      accessToken.value = storedToken
      console.log('[Auth] Restored access token from localStorage')
    }
    
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
        console.log('[Auth] Restored user from localStorage:', user.value?.email)
      } catch (e) {
        console.error('[Auth] Failed to parse stored user:', e)
        localStorage.removeItem('user') // 清除损坏的数据
      }
    }
    
    if (storedRefreshToken) {
      refreshToken.value = storedRefreshToken
    }
  }

  // 是否已登录
  const isLoggedIn = computed(() => {
    const loggedIn = !!accessToken.value && !!user.value
    if (process.client) {
      console.log('[Auth] Login status:', loggedIn, { 
        hasToken: !!accessToken.value, 
        hasUser: !!user.value 
      })
    }
    return loggedIn
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
   * 获取当前用户信息（从服务器刷新）
   */
  const fetchCurrentUser = async () => {
    if (!accessToken.value) return

    try {
      const response = await $fetch<any>('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      })

      if (response.success) {
        user.value = response.data
        localStorage.setItem('user', JSON.stringify(response.data))
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // Token 可能已过期，清除登录状态
      logout()
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
    isLoggedIn,
    loading: readonly(loading),

    // 方法
    login,
    register,
    logout,
    fetchCurrentUser,
    refreshUserInfo: fetchCurrentUser, // 别名
    updateProfile,
  }
}

