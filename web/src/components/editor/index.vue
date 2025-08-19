<template>
  <div class="editor" >
    <div ref="domRef"></div>
  </div>
</template>
<script setup lang="ts">


const domRef = ref()

onMounted(() => {
})
</script>
<style scoped lang="less">
.editor {
  height: 300px;
  width: 300px;

  > div {
    height: 100%;
    width: 100%;
  }
}
</style>
