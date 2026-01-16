<script setup lang="ts">
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

// 测试账号快速填充
const useDemoAccount = () => {
  form.email = 'alice@example.com'
  form.password = 'password123'
  toast.add({
    title: '已填充测试账号',
    description: '点击登录按钮即可使用测试账号登录',
    color: 'info',
  })
}
</script>

<template>
  <div class="min-h-screen relative overflow-hidden">
    <!-- 背景装饰 -->
    <div class="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <!-- 装饰性圆形 -->
      <div class="absolute top-0 left-0 w-96 h-96 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div class="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
    </div>

    <!-- 内容区域 -->
    <div class="relative min-h-screen flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <!-- Logo 和标题 -->
        <div class="text-center mb-8 animate-fade-in">
          <div class="inline-block mb-4">
            <div class="text-6xl mb-2 animate-bounce-slow">🏳️‍🌈</div>
          </div>
          <h1 class="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            LinkLantern
          </h1>
          <p class="text-gray-600 dark:text-gray-400 text-lg">欢迎回来！登录您的账户</p>
        </div>

        <!-- 登录表单卡片 -->
        <UCard class="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 shadow-2xl border-0 animate-slide-up">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold">登录</h2>
              <UIcon name="i-mdi-login" class="text-2xl text-primary" />
            </div>
          </template>

          <form @submit.prevent="handleLogin" class="space-y-6">
            <!-- 邮箱输入 -->
            <UFormGroup label="邮箱地址" :error="errors.email">
              <UInput
                v-model="form.email"
                type="email"
                placeholder="your@email.com"
                size="xl"
                icon="i-mdi-email"
                :disabled="loading"
                @input="errors.email = ''"
                class="transition-all duration-300 focus:scale-[1.01]"
              />
            </UFormGroup>

            <!-- 密码输入 -->
            <UFormGroup label="密码" :error="errors.password">
              <UInput
                v-model="form.password"
                type="password"
                placeholder="••••••••"
                size="xl"
                icon="i-mdi-lock"
                :disabled="loading"
                @input="errors.password = ''"
                class="transition-all duration-300 focus:scale-[1.01]"
              />
            </UFormGroup>

            <!-- 记住密码和忘记密码 -->
            <div class="flex items-center justify-between text-sm">
              <UCheckbox v-model="rememberMe" label="记住我" class="select-none" />
              <UButton variant="link" color="primary" size="sm" disabled class="font-medium">
                忘记密码？
              </UButton>
            </div>

            <!-- 登录按钮 -->
            <UButton
              type="submit"
              size="xl"
              block
              :loading="loading"
              :disabled="loading"
              class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span class="flex items-center justify-center gap-2">
                <UIcon v-if="!loading" name="i-mdi-login" />
                <span>{{ loading ? '登录中...' : '立即登录' }}</span>
              </span>
            </UButton>

            <!-- 分隔线 -->
            <div class="relative my-6">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  或者
                </span>
              </div>
            </div>

            <!-- 测试账号提示 -->
            <div class="space-y-3">
              <UAlert
                color="info"
                variant="soft"
                icon="i-mdi-test-tube"
                class="border border-blue-200 dark:border-blue-800"
              >
                <template #title>
                  <span class="font-semibold">开发测试模式</span>
                </template>
                <template #description>
                  <p class="text-sm mt-1">使用测试账号快速体验系统功能</p>
                </template>
              </UAlert>
              
              <UButton
                color="info"
                variant="outline"
                size="lg"
                block
                @click="useDemoAccount"
                :disabled="loading"
                class="transition-all duration-300 hover:scale-[1.02]"
              >
                <span class="flex items-center justify-center gap-2">
                  <UIcon name="i-mdi-account-circle" />
                  <span>填充测试账号</span>
                </span>
              </UButton>
            </div>
          </form>
        </UCard>

        <!-- 注册链接 -->
        <div class="mt-8 text-center animate-fade-in-delayed">
          <div class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-lg">
            <span class="text-gray-600 dark:text-gray-400">还没有账户？</span>
            <UButton
              variant="link"
              color="primary"
              to="/register"
              class="font-semibold"
            >
              立即注册 →
            </UButton>
          </div>
        </div>

        <!-- 返回首页 -->
        <div class="mt-6 text-center animate-fade-in-delayed">
          <UButton variant="link" color="gray" to="/" icon="i-mdi-arrow-left" size="lg">
            返回首页
          </UButton>
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
  0%, 100% {
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

