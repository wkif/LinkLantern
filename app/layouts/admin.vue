<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- 顶部导航栏 -->
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <!-- Logo 和标题 -->
          <div class="flex items-center gap-4">
            <NuxtLink to="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span class="text-2xl">🏳️‍🌈</span>
              <span class="font-bold text-lg">LinkLantern</span>
            </NuxtLink>
            <UBadge color="primary" variant="subtle">管理后台</UBadge>
          </div>

          <!-- 用户菜单 -->
          <div class="flex items-center gap-4">
            <UButton to="/" variant="ghost" icon="i-mdi-home">
              返回首页
            </UButton>

            <UDropdown :items="userMenuItems" :popper="{ placement: 'bottom-end' }">
              <UAvatar :src="user?.avatar" :alt="user?.name || user?.email" size="sm" class="cursor-pointer">
                <template v-if="!user?.avatar">
                  {{ (user?.name || user?.email || 'U').charAt(0).toUpperCase() }}
                </template>
              </UAvatar>

              <template #account>
                <div class="text-left px-2 py-1.5">
                  <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {{ user?.name || '未设置用户名' }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {{ user?.email }}
                  </p>
                </div>
              </template>
            </UDropdown>
          </div>
        </div>
      </div>
    </header>

    <div class="container mx-auto px-4 py-6">
      <div class="flex gap-6">
        <!-- 侧边栏导航 -->
        <aside class="w-64 flex-shrink-0">
          <UCard>
            <nav class="space-y-1">
              <NuxtLink v-for="item in navItems" :key="item.path" :to="item.path"
                class="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors" :class="isActivePath(item.path)
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'">
                <UIcon :name="item.icon" class="text-xl" />
                <span>{{ item.label }}</span>
                <UBadge v-if="item.badge" :color="item.badgeColor" variant="subtle" size="xs" class="ml-auto">
                  {{ item.badge }}
                </UBadge>
              </NuxtLink>
            </nav>
          </UCard>

        </aside>

        <!-- 主内容区 -->
        <main class="flex-1 min-w-0">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, logout } = useAuth()
const { links } = useLinks()
const router = useRouter()
const route = useRoute()
const toast = useToast()

// 控制添加链接模态框
const showAddLinkModal = ref(false)

// 导航项
const navItems = computed(() => [
  {
    path: '/admin',
    icon: 'i-mdi-view-dashboard',
    label: '概览',
  },
  {
    path: '/admin/profile',
    icon: 'i-mdi-account',
    label: '个人信息',
  },
  {
    path: '/admin/links',
    icon: 'i-mdi-link-variant',
    label: '链接管理',
    badge: links.value.length,
    badgeColor: 'primary',
  },
  {
    path: '/admin/settings',
    icon: 'i-mdi-cog',
    label: '设置',
  },
])

// 判断当前路径是否激活
const isActivePath = (path: string) => {
  if (path === '/admin') {
    return route.path === '/admin'
  }
  return route.path.startsWith(path)
}

// 用户菜单
const userMenuItems = computed(() => [
  [{
    label: user.value?.email || '',
    slot: 'account',
    disabled: true,
  }],
  [{
    label: '退出登录',
    icon: 'i-mdi-logout',
    click: handleLogout,
  }],
])

// 处理登出
const handleLogout = () => {
  logout()
  toast.add({
    title: '已退出登录',
    description: '期待您的再次访问',
    color: 'info',
  })
  router.push('/login')
}

// 跳转到添加链接
const navigateToAddLink = () => {
  showAddLinkModal.value = false
  router.push('/admin/links?action=add')
}
</script>
