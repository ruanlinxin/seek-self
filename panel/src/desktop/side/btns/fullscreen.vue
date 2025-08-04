<template>
  <div class="desktop-side-item" @click.stop="basicStore.fullScreenToggle()">
    <a-tooltip :content="full ? '退出全屏' : '全屏'" position="right">
      <icon-fullscreen-exit v-if="full" />
      <icon-fullscreen v-else/>
    </a-tooltip>
  </div>
</template>
<script setup lang="ts">
import {getBasicStore} from "@/modules/basic/store";

const basicStore = getBasicStore()
const full = computed(() => basicStore.setting.fullScreen)

</script>
