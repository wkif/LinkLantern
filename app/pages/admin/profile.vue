<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'admin',
})

const { user, accessToken, refreshUserInfo } = useAuth()
const toast = useToast()

// 表单数据
const form = ref({
  name: user.value?.name || '',
  email: user.value?.email || '',
  avatar: user.value?.avatar || '',
})

// 密码修改表单
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// 加载和保存状态
const loading = ref(false)
const savingProfile = ref(false)
const savingPassword = ref(false)

// 监听用户信息变化
watch(user, (newUser) => {
  if (newUser) {
    form.value = {
      name: newUser.name || '',
      email: newUser.email || '',
      avatar: newUser.avatar || '',
    }
  }
}, { immediate: true })

// 表单验证规则
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePassword = (password: string) => {
  return password.length >= 8
}

// 保存个人信息
const saveProfile = async () => {
  // 验证
  if (!form.value.email) {
    toast.add({
      title: '错误',
      description: '邮箱不能为空',
      color: 'error',
    })
    return
  }

  if (!validateEmail(form.value.email)) {
    toast.add({
      title: '错误',
      description: '请输入有效的邮箱地址',
      color: 'error',
    })
    return
  }

  savingProfile.value = true

  try {
    const response = await $fetch<any>('/api/auth/me', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
      body: {
        name: form.value.name || undefined,
        avatar: form.value.avatar || undefined,
      },
    })

    if (response.success) {
      // 刷新用户信息
      await refreshUserInfo()
      
      toast.add({
        title: '成功',
        description: '个人信息已更新',
        color: 'success',
      })
    }
  } catch (error: any) {
    console.error('更新失败:', error)
    toast.add({
      title: '更新失败',
      description: error.data?.statusMessage || '请稍后重试',
      color: 'error',
    })
  } finally {
    savingProfile.value = false
  }
}

// 修改密码
const changePassword = async () => {
  // 验证
  if (!passwordForm.value.currentPassword) {
    toast.add({
      title: '错误',
      description: '请输入当前密码',
      color: 'error',
    })
    return
  }

  if (!passwordForm.value.newPassword) {
    toast.add({
      title: '错误',
      description: '请输入新密码',
      color: 'error',
    })
    return
  }

  if (!validatePassword(passwordForm.value.newPassword)) {
    toast.add({
      title: '错误',
      description: '新密码至少需要8个字符',
      color: 'error',
    })
    return
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.add({
      title: '错误',
      description: '两次输入的新密码不一致',
      color: 'error',
    })
    return
  }

  savingPassword.value = true

  try {
    const response = await $fetch<any>('/api/auth/password', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
      body: {
        currentPassword: passwordForm.value.currentPassword,
        newPassword: passwordForm.value.newPassword,
      },
    })

    if (response.success) {
      toast.add({
        title: '成功',
        description: '密码已更新',
        color: 'success',
      })

      // 清空表单
      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }
    }
  } catch (error: any) {
    console.error('修改密码失败:', error)
    toast.add({
      title: '修改失败',
      description: error.data?.statusMessage || '请检查当前密码是否正确',
      color: 'error',
    })
  } finally {
    savingPassword.value = false
  }
}

// 取消编辑
const cancelEdit = () => {
  form.value = {
    name: user.value?.name || '',
    email: user.value?.email || '',
    avatar: user.value?.avatar || '',
  }
}

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div>
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold mb-2">个人信息</h1>
      <p class="text-gray-600 dark:text-gray-400">
        管理您的个人资料和账户设置
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 用户头像卡片 -->
      <UCard>
        <div class="flex flex-col items-center text-center">
          <UAvatar
            :src="form.avatar"
            :alt="form.name || form.email"
            size="3xl"
            class="mb-4"
          >
            <template v-if="!form.avatar">
              {{ (form.name || form.email || 'U').charAt(0).toUpperCase() }}
            </template>
          </UAvatar>

          <h3 class="text-xl font-semibold mb-1">
            {{ form.name || '未设置用户名' }}
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {{ form.email }}
          </p>

          <div class="w-full space-y-2 text-sm text-left">
            <div class="flex items-center justify-between py-2 border-t border-gray-200 dark:border-gray-700">
              <span class="text-gray-600 dark:text-gray-400">账户ID</span>
              <span class="font-mono">{{ user?.id }}</span>
            </div>
            <div class="flex items-center justify-between py-2 border-t border-gray-200 dark:border-gray-700">
              <span class="text-gray-600 dark:text-gray-400">注册时间</span>
              <span>{{ formatDate(user?.createdAt || '') }}</span>
            </div>
            <div class="flex items-center justify-between py-2 border-t border-b border-gray-200 dark:border-gray-700">
              <span class="text-gray-600 dark:text-gray-400">更新时间</span>
              <span>{{ formatDate(user?.updatedAt || '') }}</span>
            </div>
          </div>
        </div>
      </UCard>

      <!-- 个人信息表单 -->
      <div class="lg:col-span-2 space-y-6">
        <!-- 基本信息 -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold flex items-center gap-2">
              <UIcon name="i-mdi-account-edit" />
              基本信息
            </h2>
          </template>

          <form @submit.prevent="saveProfile" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">用户名</label>
              <UInput
                v-model="form.name"
                placeholder="请输入用户名"
                size="lg"
                icon="i-mdi-account"
              />
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                用于显示的名称，可以为空
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">邮箱地址</label>
              <UInput
                v-model="form.email"
                type="email"
                placeholder="your@email.com"
                size="lg"
                icon="i-mdi-email"
                disabled
              />
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                邮箱地址不可修改
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">头像URL</label>
              <UInput
                v-model="form.avatar"
                placeholder="https://example.com/avatar.jpg"
                size="lg"
                icon="i-mdi-image"
              />
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                请输入有效的图片链接
              </p>
            </div>

            <div class="flex justify-end gap-2 pt-4">
              <UButton
                type="button"
                @click="cancelEdit"
              >
                取消
              </UButton>
              <UButton
                type="submit"
                color="primary"
                :loading="savingProfile"
                :disabled="savingProfile"
              >
                保存更改
              </UButton>
            </div>
          </form>
        </UCard>

        <!-- 修改密码 -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold flex items-center gap-2">
              <UIcon name="i-mdi-lock" />
              修改密码
            </h2>
          </template>

          <form @submit.prevent="changePassword" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">当前密码</label>
              <UInput
                v-model="passwordForm.currentPassword"
                type="password"
                placeholder="请输入当前密码"
                size="lg"
                icon="i-mdi-lock"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">新密码</label>
              <UInput
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="请输入新密码（至少8个字符）"
                size="lg"
                icon="i-mdi-lock-plus"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">确认新密码</label>
              <UInput
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                size="lg"
                icon="i-mdi-lock-check"
              />
            </div>

            <div class="flex justify-end gap-2 pt-4">
              <UButton
                type="submit"
                color="primary"
                :loading="savingPassword"
                :disabled="savingPassword"
              >
                修改密码
              </UButton>
            </div>
          </form>
        </UCard>

        <!-- 账户安全提示 -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold flex items-center gap-2">
              <UIcon name="i-mdi-shield-check" />
              安全提示
            </h2>
          </template>

          <div class="space-y-3 text-sm">
            <div class="flex items-start gap-3">
              <UIcon name="i-mdi-check-circle" class="text-green-600 dark:text-green-400 text-lg flex-shrink-0 mt-0.5" />
              <div>
                <p class="font-medium mb-1">定期更换密码</p>
                <p class="text-gray-600 dark:text-gray-400">
                  建议每3个月更换一次密码，提高账户安全性
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <UIcon name="i-mdi-check-circle" class="text-green-600 dark:text-green-400 text-lg flex-shrink-0 mt-0.5" />
              <div>
                <p class="font-medium mb-1">使用强密码</p>
                <p class="text-gray-600 dark:text-gray-400">
                  密码应包含大小写字母、数字和特殊字符
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <UIcon name="i-mdi-check-circle" class="text-green-600 dark:text-green-400 text-lg flex-shrink-0 mt-0.5" />
              <div>
                <p class="font-medium mb-1">保护账户信息</p>
                <p class="text-gray-600 dark:text-gray-400">
                  不要与他人分享您的密码和登录信息
                </p>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

