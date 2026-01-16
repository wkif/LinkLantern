// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@vueuse/nuxt'],

  css: ['~/assets/css/index.css', '~/assets/css/font.css'],

  // 自定义 Nuxt UI 主题
  ui: {
    primary: 'primary',
    gray: 'secondary',
  },

  // Nuxt UI 的颜色模式配置
  colorMode: {
    preference: 'light',
  },

  // Nitro 配置，用于 Vercel 部署
  nitro: {
    preset: 'vercel',
    // Prisma Client 兼容性配置
    moduleSideEffects: ['@prisma/client'],
    alias: {
      '.prisma/client': './node_modules/.prisma/client'
    }
  },

  // 运行时配置
  runtimeConfig: {
    // 私密配置（仅服务端可用）
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    databaseUrl: process.env.DATABASE_URL,
  }
})
