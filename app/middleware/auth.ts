/**
 * 认证中间件
 * 保护需要登录才能访问的页面
 */

export default defineNuxtRouteMiddleware((to, from) => {
  const { isLoggedIn } = useAuth()

  // 如果用户未登录，重定向到登录页面
  if (!isLoggedIn.value) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }, // 保存目标路径，登录后跳转
    })
  }
})

