<script setup lang="ts">
definePageMeta({
  layout: false,
})

const { register, loading } = useAuth()
const router = useRouter()
const toast = useToast()

// 表单数据
const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  name: '',
})

// 同意条款
const agreeTerms = ref(false)

// 表单验证状态
const errors = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  name: '',
  terms: '',
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
  
  // 验证用户名
  if (form.name && form.name.length > 50) {
    errors.name = '用户名长度不能超过 50 个字符'
    isValid = false
  } else {
    errors.name = ''
  }
  
  // 验证密码
  if (!form.password) {
    errors.password = '请输入密码'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = '密码长度至少为 6 个字符'
    isValid = false
  } else if (form.password.length > 100) {
    errors.password = '密码长度不能超过 100 个字符'
    isValid = false
  } else {
    errors.password = ''
  }
  
  // 验证确认密码
  if (!form.confirmPassword) {
    errors.confirmPassword = '请再次输入密码'
    isValid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = '两次输入的密码不一致'
    isValid = false
  } else {
    errors.confirmPassword = ''
  }
  
  // 验证是否同意条款
  if (!agreeTerms.value) {
    errors.terms = '请阅读并同意服务条款'
    isValid = false
  } else {
    errors.terms = ''
  }
  
  return isValid
}

// 密码强度计算
const passwordStrength = computed(() => {
  const password = form.password
  if (!password) return { level: 0, text: '', color: 'gray' }
  
  let strength = 0
  
  // 长度
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  
  // 包含数字
  if (/\d/.test(password)) strength++
  
  // 包含小写字母
  if (/[a-z]/.test(password)) strength++
  
  // 包含大写字母
  if (/[A-Z]/.test(password)) strength++
  
  // 包含特殊字符
  if (/[^a-zA-Z0-9]/.test(password)) strength++
  
  if (strength <= 2) return { level: 1, text: '弱', color: 'red' }
  if (strength <= 4) return { level: 2, text: '中等', color: 'yellow' }
  return { level: 3, text: '强', color: 'green' }
})

// 处理注册
const handleRegister = async () => {
  if (!validate()) return
  
  const result = await register({
    email: form.email,
    password: form.password,
    name: form.name || undefined,
  })
  
  if (result?.success) {
    toast.add({
      title: '注册成功',
      description: '欢迎加入 LinkLantern！',
      color: 'success',
    })
    // 跳转到首页
    router.push('/')
  } else {
    toast.add({
      title: '注册失败',
      description: result?.message || '请检查您的输入信息',
      color: 'error',
    })
  }
}
</script>

<template>
  <div class="min-h-screen relative overflow-hidden">
    <!-- 背景装饰 -->
    <div class="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <!-- 装饰性圆形 -->
      <div class="absolute top-0 right-0 w-96 h-96 bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
      <div class="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-200/20 dark:bg-pink-900/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
    </div>

    <!-- 内容区域 -->
    <div class="relative min-h-screen flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <!-- Logo 和标题 -->
        <div class="text-center mb-8 animate-fade-in">
          <div class="inline-block mb-4">
            <div class="text-6xl mb-2 animate-bounce-slow">🏳️‍🌈</div>
          </div>
          <h1 class="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            LinkLantern
          </h1>
          <p class="text-gray-600 dark:text-gray-400 text-lg">开始您的导航之旅</p>
        </div>

        <!-- 注册表单卡片 -->
        <UCard class="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 shadow-2xl border-0 animate-slide-up">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold">创建账户</h2>
              <UIcon name="i-mdi-account-plus" class="text-2xl text-primary" />
            </div>
          </template>

          <form @submit.prevent="handleRegister" class="space-y-5">
            <!-- 邮箱输入 -->
            <UFormGroup label="邮箱地址" :error="errors.email" required>
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

            <!-- 用户名输入 -->
            <UFormGroup label="用户名" :error="errors.name">
              <template #description>
                <span class="text-xs text-gray-500">可选，用于个性化您的账户</span>
              </template>
              <UInput
                v-model="form.name"
                type="text"
                placeholder="您的昵称"
                size="xl"
                icon="i-mdi-account"
                :disabled="loading"
                @input="errors.name = ''"
                class="transition-all duration-300 focus:scale-[1.01]"
              />
            </UFormGroup>

            <!-- 密码输入 -->
            <UFormGroup label="密码" :error="errors.password" required>
              <UInput
                v-model="form.password"
                type="password"
                placeholder="至少 6 个字符"
                size="xl"
                icon="i-mdi-lock"
                :disabled="loading"
                @input="errors.password = ''"
                class="transition-all duration-300 focus:scale-[1.01]"
              />
              <!-- 密码强度指示器 - 增强版 -->
              <div v-if="form.password" class="mt-3 space-y-2">
                <div class="flex items-center gap-3">
                  <div class="flex-1 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                    <div
                      class="h-full transition-all duration-500 ease-out rounded-full"
                      :class="{
                        'bg-gradient-to-r from-red-500 to-red-600': passwordStrength.color === 'red',
                        'bg-gradient-to-r from-yellow-400 to-yellow-500': passwordStrength.color === 'yellow',
                        'bg-gradient-to-r from-green-500 to-green-600': passwordStrength.color === 'green',
                      }"
                      :style="{ width: `${(passwordStrength.level / 3) * 100}%` }"
                    />
                  </div>
                  <span
                    class="text-sm font-bold min-w-[3rem] text-right"
                    :class="{
                      'text-red-500': passwordStrength.color === 'red',
                      'text-yellow-500': passwordStrength.color === 'yellow',
                      'text-green-500': passwordStrength.color === 'green',
                    }"
                  >
                    {{ passwordStrength.text }}
                  </span>
                </div>
                <!-- 密码要求提示 -->
                <div class="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                  <div class="flex items-center gap-2">
                    <UIcon 
                      :name="form.password.length >= 8 ? 'i-mdi-check-circle' : 'i-mdi-circle-outline'" 
                      :class="form.password.length >= 8 ? 'text-green-500' : 'text-gray-400'"
                    />
                    <span>至少 8 个字符</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <UIcon 
                      :name="/\d/.test(form.password) ? 'i-mdi-check-circle' : 'i-mdi-circle-outline'" 
                      :class="/\d/.test(form.password) ? 'text-green-500' : 'text-gray-400'"
                    />
                    <span>包含数字</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <UIcon 
                      :name="/[A-Z]/.test(form.password) ? 'i-mdi-check-circle' : 'i-mdi-circle-outline'" 
                      :class="/[A-Z]/.test(form.password) ? 'text-green-500' : 'text-gray-400'"
                    />
                    <span>包含大写字母</span>
                  </div>
                </div>
              </div>
            </UFormGroup>

            <!-- 确认密码输入 -->
            <UFormGroup label="确认密码" :error="errors.confirmPassword" required>
              <UInput
                v-model="form.confirmPassword"
                type="password"
                placeholder="再次输入密码"
                size="xl"
                icon="i-mdi-lock-check"
                :disabled="loading"
                @input="errors.confirmPassword = ''"
                class="transition-all duration-300 focus:scale-[1.01]"
              >
                <template v-if="form.confirmPassword && form.password === form.confirmPassword" #trailing>
                  <UIcon name="i-mdi-check-circle" class="text-green-500" />
                </template>
              </UInput>
            </UFormGroup>

            <!-- 同意条款 -->
            <div class="space-y-2 pt-2">
              <div class="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
                <UCheckbox
                  v-model="agreeTerms"
                  @change="errors.terms = ''"
                  class="mt-0.5"
                />
                <div class="flex-1">
                  <span class="text-sm text-gray-700 dark:text-gray-300">
                    我已阅读并同意
                    <UButton variant="link" color="primary" size="xs" disabled class="p-0">
                      服务条款
                    </UButton>
                    和
                    <UButton variant="link" color="primary" size="xs" disabled class="p-0">
                      隐私政策
                    </UButton>
                  </span>
                </div>
              </div>
              <p v-if="errors.terms" class="text-sm text-red-500 flex items-center gap-1">
                <UIcon name="i-mdi-alert-circle" />
                {{ errors.terms }}
              </p>
            </div>

            <!-- 注册按钮 -->
            <UButton
              type="submit"
              size="xl"
              block
              :loading="loading"
              :disabled="loading"
              class="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-6"
            >
              <span class="flex items-center justify-center gap-2">
                <UIcon v-if="!loading" name="i-mdi-rocket-launch" />
                <span>{{ loading ? '注册中...' : '立即注册' }}</span>
              </span>
            </UButton>
          </form>
        </UCard>

        <!-- 登录链接 -->
        <div class="mt-8 text-center animate-fade-in-delayed">
          <div class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-lg">
            <span class="text-gray-600 dark:text-gray-400">已经有账户了？</span>
            <UButton
              variant="link"
              color="primary"
              to="/login"
              class="font-semibold"
            >
              立即登录 →
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

