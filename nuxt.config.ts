// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@vueuse/nuxt'],

  css: ['~/assets/css/index.css', '~/assets/css/font.css'],

  // Nitro 配置，用于 Vercel 部署
  nitro: {
    preset: 'vercel',
    // 确保 Prisma Client 正确打包
    externals: {
      inline: ['@prisma/client']
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
