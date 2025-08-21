<template>
  <div class="basic-window" tabindex="0" ref="windowRef" data-role="window" :class="{full:full}" :style="style">
    <div class="basic-window-header">
      <div class="left" @mousedown="addListener">{{ app.name }}</div>
      <div class="right">
        <div class="item" @click="toggleFull()">
          <icon-fullscreen-exit v-if="full"/>
          <icon-fullscreen v-else/>
        </div>
        <div class="item" @click.stop="handleClose">
          <icon-close/>
        </div>
      </div>
    </div>
    <div class="basic-window-content">
        <View/>
    </div>
    <WindowResize v-if="canResize"/>
  </div>
</template>
<script setup lang="ts">
import WindowResize from "@/modules/basic/components/window/window-resize.vue";
import {getAppsStore} from "@/modules/app/store";
import {App} from "@/modules/app/type";
import {getAsyncComponent} from "@/modules/app/meta";

const appStore = getAppsStore()
const props = defineProps<{
  appid: string
}>()
const app = computed<App.running>(() => appStore.idMap[props.appid])
const View = getAsyncComponent(app.value.entity)
const getWindow = () => app.value.window
provide('APP', app)
const full = computed(() => getWindow().fullScreen)
const canResize = computed(() => {
  // 是否可变更大小
  const a = app.value.window.resizable
  // 是否全屏状态
  const b = full.value
  return a && !b
})
const toggleFull = () => {
  getWindow().fullScreen = !getWindow().fullScreen
}


const style = computed(() => {
  const res: Record<string, any> = {}
  if (!full.value) {
    const {left, top, width, height} = getWindow()
    res.left = left + 'px'
    res.top = top + 'px'
    res.width = width + 'px'
    res.height = height + 'px'
  }
  return res
})


const getSafeArea = (v: number, max: number) => {
  return Math.max(0, Math.min(v, max - 10))
}

const move = (e: MouseEvent) => {
  const {clientX, clientY} = e
  const WINDOW = getWindow()
  WINDOW.left = getSafeArea(clientX - offset.x, window.innerWidth)
  WINDOW.top = getSafeArea(clientY - offset.y, window.innerHeight)
}

const removeListener = () => {
  window.removeEventListener('mousemove', move)
  window.removeEventListener('mouseup', removeListener)
}

const offset = {
  x: 0,
  y: 0,
}
const addListener = (e: MouseEvent) => {
  if (full.value) return
  removeListener()
  const {offsetX: x, offsetY: y} = e
  Object.assign(offset, {x, y})
  window.addEventListener('mousemove', move)
  window.addEventListener('mouseup', removeListener)
}


const handleClose = () => {
  appStore.close(props.appid)
}

const windowRef = ref()

onMounted(() => {
})
</script>
<style scoped lang="less">
.basic-window {
  position: fixed;
  border-radius: var(--radius);
  box-shadow: var(--shadow1);
  background: #fff;
  overflow: hidden;

  &:focus {
    outline: 2px solid var(--white-glass);
    z-index: 1;
  }

  &.full {
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
  }

  .basic-window-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    //padding: 4px 10px;
    border-bottom: 1px solid var(--border-color);
    height: 34px;

    .left {
      padding-left: 4px;
      flex: 1;
      overflow: hidden;
      cursor: all-scroll;
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    .right {
      padding-right: 4px;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 6px;
      cursor: pointer;

      > .item {
        padding: 6px;
        border-radius: var(--radius);

        &:hover {
          background: #f1f1f1;
        }
      }
    }
  }

  .basic-window-content {
    box-sizing: border-box;
    padding: 10px;
    min-width: 100px;
    min-height: 100px;
    height: calc(100% - 34px);
    width: 100%;
    overflow: auto;
  }
}
</style>
