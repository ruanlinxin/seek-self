<template>
  <div class="desktop">
    <TargetTiming/>
    <Side/>
    <div class="desktop-view">
      <BasicWindow v-for="item in appsStore.list" :appid="item.id"/>
    </div>
    <ToolsModal/>
  </div>
</template>
<script setup lang="ts">
import {TargetTiming} from '@/modules/widgets/components'
import {BasicWindow } from '@/modules/basic/components'
import Side from './side/index.vue'
import {getAppsStore} from "@/store";
import ToolsModal from './tools-modal/index.vue'

const appsStore = getAppsStore()
</script>
<style scoped lang="less">
.desktop {
  height: 100%;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: row;
  //background: url("https://bing.img.run/rand.php");
  background: #f6f6f6;

  .desktop-view {
    flex: 1;
    overflow: hidden;
  }
}
</style>
