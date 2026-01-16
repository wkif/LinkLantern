<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50/30 dark:from-primary-950 dark:to-secondary-900">
    <!-- 顶部导航栏 -->
    <header class="bg-white/80 dark:bg-primary-900/80 border-b border-primary-200 dark:border-primary-700 sticky top-0 z-50 backdrop-blur-md shadow-sm">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <!-- Logo 和标题 -->
          <div class="flex items-center gap-4">
            <NuxtLink to="/" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div class="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-xl">
                🏮
              </div>
              <span class="font-bold text-lg text-primary-700 dark:text-accent-400">LinkLantern</span>
            </NuxtLink>
            <UBadge class="bg-accent-400 text-primary-900 font-semibold">管理后台</UBadge>
          </div>

          <!-- 用户菜单 -->
          <div class="flex items-center gap-4">
            <UButton to="/" variant="soft" color="primary" icon="i-mdi-home" size="sm">
              返回首页
            </UButton>

            <UDropdown :items="userMenuItems" :popper="{ placement: 'bottom-end' }">
              <UAvatar :src="user?.avatar" :alt="user?.name || user?.email" size="sm" class="cursor-pointer ring-2 ring-accent-400">
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
          <UCard class="backdrop-blur-sm bg-white/90 dark:bg-primary-800/90 border border-primary-200 dark:border-primary-700 shadow-lg">
            <nav class="space-y-1">
              <NuxtLink v-for="item in navItems" :key="item.path" :to="item.path"
                class="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 card-hover" :class="isActivePath(item.path)
                  ? 'gradient-bg text-white font-semibold shadow-md'
                  : 'hover:bg-primary-50 dark:hover:bg-primary-700 text-secondary-700 dark:text-secondary-300'">
                <UIcon :name="item.icon" class="text-xl" />
                <span>{{ item.label }}</span>
                <UBadge v-if="item.badge" class="ml-auto bg-accent-400 text-primary-900 font-bold" size="xs">
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
