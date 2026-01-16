/**
 * 认证状态恢复插件
 * 在客户端启动时从 localStorage 恢复登录状态
 */

export default defineNuxtPlugin(() => {
  if (process.client) {
    const { fetchCurrentUser } = useAuth()
    
    // 从 localStorage 检查是否有 token
    const token = localStorage.getItem('accessToken')
    
    // 如果有 token，尝试获取用户信息
    if (token) {
      // 使用 nextTick 确保在组件挂载后执行
      nextTick(() => {
        fetchCurrentUser()
      })
    }
  }
})

