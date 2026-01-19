/**
 * 认证状态恢复插件
 * 在客户端启动时从 localStorage 恢复登录状态
 */

export default defineNuxtPlugin(() => {
  if (process.client) {
    const { fetchCurrentUser, isLoggedIn } = useAuth()
    
    // 如果有登录状态，静默验证 Token
    if (isLoggedIn.value) {
      console.log('[Auth Plugin] Validating stored token...')
      // 使用 nextTick 确保在组件挂载后执行
      nextTick(async () => {
        await fetchCurrentUser()
      })
    } else {
      console.log('[Auth Plugin] No stored auth state')
    }
  }
})

