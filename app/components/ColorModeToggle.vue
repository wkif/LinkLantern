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

// 获取提示文本
const tooltip = computed(() => {
  return colorMode.value === 'dark' ? '切换到浅色模式' : '切换到深色模式'
})
</script>

<template>
  <UButton
    :icon="icon"
    size="lg"
    color="primary"
    variant="ghost"
    :aria-label="tooltip"
    @click="toggleColorMode"
    class="transition-all duration-300 hover:scale-110 hover:rotate-180"
  />
</template>

<style scoped>
/* 平滑的旋转过渡 */
button {
  transition: transform 0.5s ease-in-out;
}
</style>

