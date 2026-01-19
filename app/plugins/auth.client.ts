/**
 * 认证状态恢复插件
 * 在客户端启动时从 localStorage 恢复登录状态
 */

export default defineNuxtPlugin(() => {
  if (process.client) {
    // 直接检查 localStorage，因为此时 useState 可能还没完成初始化
    const hasToken = localStorage.getItem('accessToken')
    const hasUser = localStorage.getItem('user')
    
    if (hasToken && hasUser) {
      console.log('[Auth Plugin] Found stored auth state, validating token...')
      
      const { fetchCurrentUser } = useAuth()
      
      // 使用 nextTick 确保在组件挂载后执行
      nextTick(async () => {
        await fetchCurrentUser()
      })
    } else {
      console.log('[Auth Plugin] No stored auth state')
    }
  }
})

