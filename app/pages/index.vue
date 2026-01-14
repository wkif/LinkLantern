<script setup lang="ts">
const { x, y } = useMouse()
</script>

<template>
  <div text-center>
    <div>
      kif
      <div>pos: {{ x }}, {{ y }}</div>
    </div>
  </div>
</template>

<style lang="less" scoped></style>

