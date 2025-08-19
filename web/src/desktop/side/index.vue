<template>
  <div class="desktop-side" :class="{lock:lock}">
    <div class="desktop-side-avatar">
      <Avatar/>
    </div>
    <div class="desktop-side-header">
      <div class="desktop-side-item" @click="desktopStore.toolsModal.open">
        <a-tooltip content="工具包" position="right">
          <icon-apps/>
        </a-tooltip>
      </div>
    </div>

    <div class="desktop-side-content">

    </div>
    <div class="desktop-side-footer">
      <Fullscreen/>
      <div class="desktop-side-item" @click="basicStore.lockToggle()">
        <a-tooltip :content="lock ? '已锁定' : '已解锁'" position="right">
          <icon-lock v-if="lock"/>
          <icon-unlock v-else/>
        </a-tooltip>
      </div>
      <div class="desktop-side-item">
        <a-tooltip content="设置" position="right">
          <icon-settings/>
        </a-tooltip>
      </div>
    </div>
    <div class="expand"></div>
  </div>
</template>
<script setup lang="ts">
import {Fullscreen} from "@/desktop/side/btns";
import Avatar from './avatar/index.vue'
import {getBasicStore, getDesktopStore} from '@/store'

const basicStore = getBasicStore()
const desktopStore = getDesktopStore()
const lock = computed(()=>basicStore.setting.sideLock)
</script>
<style scoped lang="less">
.desktop-side {
  background: var(--white-glass);
  box-shadow: var(--shadow1);
  width: 60px;
  position: absolute;
  display: flex;
  flex-direction: column;
  padding: 10px 0;
  box-sizing: border-box;
  height: 100%;
  transition: all .3s;
  transform: translateX(-100%);

  &.lock, &:hover {
    transform: translateX(0);
  }

  > div {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .desktop-side-avatar {
    margin-bottom: 10px;
  }

  .desktop-side-content {
    flex: 1;
  }

  .desktop-side-item {
    display: inline-block;
    box-sizing: border-box;
    padding: 8px;
    font-size: 20px;
    cursor: pointer;
    border-radius: 4px;

    &:hover {
      background: #f1f1f1;
    }
  }

  .expand {
    position: absolute;
    height: 100%;
    width: 20px;
    top: 0;
    right: -20px;
  }
}
</style>
