<script setup lang="ts">
const colorMode = useColorMode()

// 切换颜色模式
const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

// 获取当前图标
const icon = computed(() => {
  return colorMode.value === 'dark' ? 'i-mdi-weather-night' : 'i-mdi-weather-sunny'
})

</script>

<template>
  <UButton :icon="icon" size="lg" variant="ghost" :aria-label="colorMode.value === 'dark' ? '切换到浅色模式' : '切换到深色模式'"
    @click="toggleColorMode" class="min-h-11 transition-colors duration-200 btn-accent">
    <span class="hidden sm:inline">深色模式</span>
  </UButton>
</template>
