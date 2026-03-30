<script setup lang="ts">
import logoImg from '~/assets/images/logo.png'

definePageMeta({
  layout: false,
})

const { login, loading } = useAuth()
const router = useRouter()
const toast = useToast()

// 表单数据
const form = reactive({
  email: '',
  password: '',
})

// 记住密码
const rememberMe = ref(false)

// 表单验证状态
const errors = reactive({
  email: '',
  password: '',
})

// 验证邮箱
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 验证表单
const validate = () => {
  let isValid = true

  // 验证邮箱
  if (!form.email) {
    errors.email = '请输入邮箱'
    isValid = false
  } else if (!validateEmail(form.email)) {
    errors.email = '邮箱格式不正确'
    isValid = false
  } else {
    errors.email = ''
  }

  // 验证密码
  if (!form.password) {
    errors.password = '请输入密码'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = '密码长度至少为 6 个字符'
    isValid = false
  } else {
    errors.password = ''
  }

  return isValid
}

// 处理登录
const handleLogin = async () => {
  if (!validate()) return

  const result = await login({
    email: form.email,
    password: form.password,
  })

  if (result?.success) {
    toast.add({
      title: '登录成功',
      description: '欢迎回来！',
      color: 'success',
    })
    // 跳转到首页
    router.push('/')
  } else {
    toast.add({
      title: '登录失败',
      description: result?.message || '请检查您的邮箱和密码',
      color: 'error',
    })
  }
}
</script>

<template>
  <div class="min-h-screen relative overflow-hidden">
    <!-- 背景装饰 -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-primary-950 dark:via-secondary-900 dark:to-primary-900">
      <!-- 装饰性圆形 -->
      <div
        class="absolute top-0 left-0 w-96 h-96 bg-primary-200/30 dark:bg-primary-800/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2">
      </div>
      <div
        class="absolute bottom-0 right-0 w-96 h-96 bg-accent-200/40 dark:bg-accent-900/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2">
      </div>
      <div
        class="absolute top-1/2 left-1/2 w-72 h-72 bg-secondary-200/20 dark:bg-secondary-800/20 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2">
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="relative min-h-screen flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <!-- Logo 和标题 -->
        <div class="text-center mb-8 animate-fade-in">
          <img
            :src="logoImg"
            alt="LinkLantern"
            class="h-24 w-auto mx-auto mb-4 object-contain animate-bounce-slow"
          />
          <p class="text-secondary-600 dark:text-secondary-300 text-lg font-medium">欢迎回来！登录您的账户</p>
        </div>

        <!-- 登录表单卡片 -->
        <UCard
          class="backdrop-blur-md bg-white/90 dark:bg-primary-800/90 shadow-2xl border-2   dark:border-primary-700 animate-slide-up">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold dark:text-primary-300">登录</h2>
              <UIcon name="i-mdi-login" class="text-2xl text-accent-500" />
            </div>
          </template>

          <form @submit.prevent="handleLogin" class="space-y-6">
            <!-- 邮箱输入 -->
            <div class="mb-6">
              <UFormGroup label="邮箱地址" :error="errors.email">
                <UInput v-model="form.email" type="email" placeholder="your@email.com" size="xl" icon="i-mdi-email"
                  :disabled="loading" @input="errors.email = ''"
                  class="transition-all duration-300 focus:scale-[1.01]" />
              </UFormGroup>
            </div>

            <!-- 密码输入 -->
            <div class="mb-6">
              <UFormGroup label="密码" :error="errors.password">
                <UInput v-model="form.password" type="password" placeholder="••••••••" size="xl" icon="i-mdi-lock"
                  :disabled="loading" @input="errors.password = ''"
                  class="transition-all duration-300 focus:scale-[1.01]" />
              </UFormGroup>
            </div>

            <!-- 记住密码和忘记密码 -->
            <div class="flex items-center justify-between text-sm mb-6">
              <UCheckbox v-model="rememberMe" label="记住我" class="select-none" />
              <UButton variant="link" color="primary" size="sm" disabled class="font-medium">
                忘记密码？
              </UButton>
            </div>

            <!-- 登录按钮 -->
            <div class="pt-2">
              <UButton type="submit" size="xl" block :loading="loading" :disabled="loading"
                class="btn-accent transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 font-bold">
                <span class="flex items-center justify-center gap-2">
                  <UIcon v-if="!loading" name="i-mdi-login" />
                  <span>{{ loading ? '登录中...' : '立即登录' }}</span>
                </span>
              </UButton>
            </div>
          </form>
        </UCard>

        <!-- 注册链接 -->
        <div class="mt-8 text-center animate-fade-in-delayed">
          <div
            class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/80 dark:bg-primary-800/80 backdrop-blur-md shadow-lg border   dark:border-primary-700">
            <span class="text-secondary-600 dark:text-secondary-300">还没有账户？</span>
            <UButton variant="link" to="/register"
              class="font-semibold text-primary-600 dark:text-accent-400 hover:text-accent-500">
              立即注册 →
            </UButton>
          </div>
        </div>

        <!-- 返回首页 -->
        <div class="mt-6 text-center animate-fade-in-delayed space-y-3">
          <UButton variant="link" color="neutral" to="/" icon="i-mdi-arrow-left" size="lg"
            class="text-secondary-600 dark:text-secondary-300">
            返回首页
          </UButton>
          <div>
            <a
              href="/extensions/linklantern-bookmark.zip"
              download="linklantern-bookmark.zip"
              class="inline-flex items-center gap-1.5 text-sm text-primary-600 dark:text-accent-400 hover:underline"
            >
              <UIcon name="i-mdi-puzzle" class="shrink-0" />
              下载浏览器快捷收藏扩展（ZIP）
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 动画效果 */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce-slow {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}

.animate-fade-in-delayed {
  animation: fade-in 0.6s ease-out 0.2s both;
}

.animate-slide-up {
  animation: slide-up 0.6s ease-out 0.1s both;
}

.animate-bounce-slow {
  animation: bounce-slow 3s ease-in-out infinite;
}
</style>
