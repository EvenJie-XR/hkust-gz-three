<template>
  <!-- Threejs场景容器 -->
  <div class="three-container" ref="threeContainer"></div>
</template>
<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from "vue"
import { ThreeHelper } from "./threeHelper/index"

const threeContainer = ref();
onMounted(() => {
  // 创建three场景
  const threeHelper = new ThreeHelper(threeContainer.value);
  console.log(threeHelper);
  threeHelper.loadManager.loadTileset("/data/3dtiles/shenwai/tileset.json");

  onBeforeUnmount(() => {
    // 释放threejs占用的内存
    threeHelper.dispose();
  })
})
</script>

<style lang="scss" scoped>
.three-container {
  width: 100%;
  height: 100%;
}
</style>
