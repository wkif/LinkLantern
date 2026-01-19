/**
 * HTTP 拦截器插件
 * 自动处理 401 错误并尝试刷新 token
 */

export default defineNuxtPlugin(() => {
  const { refreshAccessToken, accessToken, logout } = useAuth()

  // 记录正在刷新的 Promise，避免并发请求多次刷新
  let refreshingPromise: Promise<boolean> | null = null

  // 使用 $fetch 的拦截器
  if (process.client) {
    const originalFetch = globalThis.$fetch

    // @ts-ignore
    globalThis.$fetch = new Proxy(originalFetch, {
      apply: async (target, thisArg, argumentsList) => {
        try {
          // 执行原始请求
          return await Reflect.apply(target, thisArg, argumentsList)
        } catch (error: any) {
          // 如果是 401 错误且不是刷新 token 的请求
          if (error.statusCode === 401 && !argumentsList[0]?.includes('/api/auth/refresh')) {
            console.log('[HTTP Interceptor] 401 error detected, attempting token refresh...')

            // 如果已经有刷新请求在进行中，等待它完成
            if (refreshingPromise) {
              console.log('[HTTP Interceptor] Waiting for ongoing refresh...')
              const refreshed = await refreshingPromise
              if (!refreshed) {
                throw error
              }
            } else {
              // 创建新的刷新请求
              refreshingPromise = refreshAccessToken()
              const refreshed = await refreshingPromise
              refreshingPromise = null

              if (!refreshed) {
                console.log('[HTTP Interceptor] Token refresh failed')
                throw error
              }
            }

            // Token 刷新成功，重试原始请求
            console.log('[HTTP Interceptor] Token refreshed, retrying original request...')
            
            // 如果原始请求包含 Authorization header，更新它
            if (argumentsList[1]?.headers?.Authorization && accessToken.value) {
              argumentsList[1].headers.Authorization = `Bearer ${accessToken.value}`
            }

            // 重试请求
            return await Reflect.apply(target, thisArg, argumentsList)
          }

          // 其他错误直接抛出
          throw error
        }
      }
    })

    console.log('[HTTP Interceptor] Installed')
  }
})

