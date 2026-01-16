<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'admin',
})
</script>

<template>
  <div>
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold mb-2">关于</h1>
      <p class="text-gray-600 dark:text-gray-400">
        了解 LinkLantern
      </p>
    </div>

    <!-- 关于 -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold flex items-center gap-2">
          <UIcon name="i-mdi-information" />
          应用信息
        </h2>
      </template>

      <div class="space-y-3 text-sm">
        <div class="flex items-center justify-between">
          <span class="text-gray-600 dark:text-gray-400">应用名称</span>
          <span class="font-medium">LinkLantern</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-600 dark:text-gray-400">版本号</span>
          <span class="font-medium">1.0.0</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-600 dark:text-gray-400">框架</span>
          <span class="font-medium">Nuxt 4</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-600 dark:text-gray-400">UI 组件库</span>
          <span class="font-medium">Nuxt UI</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-600 dark:text-gray-400">数据库</span>
          <span class="font-medium">Prisma + MySQL</span>
        </div>
        <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 class="font-medium mb-2">关于 LinkLantern</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            LinkLantern 是一个现代化的个人链接管理工具，帮助您收藏和分享优质网站。
          </p>
          <div class="space-y-2 text-gray-600 dark:text-gray-400">
            <p>✨ 特色功能：</p>
            <ul class="list-disc list-inside space-y-1 ml-2">
              <li>智能搜索，支持多个搜索引擎</li>
              <li>实时热点榜单，聚合 50+ 平台</li>
              <li>链接收藏与分类管理</li>
              <li>公开分享优质链接</li>
              <li>完整的用户认证系统</li>
              <li>响应式设计，支持深色模式</li>
            </ul>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

