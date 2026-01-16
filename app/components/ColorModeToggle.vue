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
  <UButton :icon="icon" size="lg" variant="ghost" @click="toggleColorMode"
    class="transition-all duration-300 hover:scale-110 btn-accent">
    深色模式
  </UButton>
</template>

<style scoped>
/* 平滑的旋转过渡 */
button {
  transition: transform 0.5s ease-in-out;
}
</style>
