<template>
  <div class="window-resize" v-for="type in types" :class="[type]" :key="type"
       @mousedown="handlerStart($event,type)"></div>
</template>
<script setup lang="ts">
import requestAnimationFrame from "zrender/lib/animation/requestAnimationFrame";
import pick from "@arco-design/web-vue/es/_utils/pick";
import {App} from "@/modules/app/type";
import {Ref} from "vue";

const app = inject<Ref<App.running>>('APP')
const types = [
  'top',
  'bottom',
  'left',
  'right',
  "top-left",
  'top-right',
  "bottom-left",
  'bottom-right'
]
const state = {
  ing: false,
  windowInfo: {
    left: 0,
    top: 0,
    width: 0,
    height: 0
  },
  x: 0,
  y: 0,
  curX: 0,
  curY: 0,
  type: '',
}
const handlerStart = (e: MouseEvent, type: string) => {
  const {clientX: x, clientY: y} = e
  if (!state.ing) {
    Object.assign(state, {x, y, type, ing: true})
    state.windowInfo = pick(app.value.window, ['left', 'top', 'width', 'height'])
    window.addEventListener('mousemove', handlerMove)
    window.addEventListener('mouseup', handlerEnd)
  }
}

const handlerMove = (e: MouseEvent) => {
  const {clientX: x, clientY: y} = e
  Object.assign(state, {curX: x, curY: y})
  requestAnimationFrame(handleOffset)
}
const handlerEnd = () => {
  state.ing = false
  window.removeEventListener('mousemove', handlerMove)
  window.removeEventListener('mouseup', handlerEnd)
}

const getSafeSize = (v: number) => Math.max(v, 100)
const map = {
  top() {
    const {y, curY, windowInfo: {height, top}} = state
    const diff = y - curY
    app.value.window.top = Math.min(top, top - diff)
    if (app.value.window.top === top) return
    app.value.window.height = getSafeSize(height + diff)
  },
  bottom() {
    const {y, curY, windowInfo: {height}} = state
    const diff = y - curY
    app.value.window.height = getSafeSize(height - diff)
  },
  left() {
    const {x, curX, windowInfo: {width, left}} = state
    const diff = x - curX
    app.value.window.left = Math.min(left, left - diff)
    if (app.value.window.left === left) return
    app.value.window.width = getSafeSize(width + diff)
  },
  right() {
    const {x, curX, windowInfo: {width}} = state
    const diff = x - curX
    app.value.window.width = getSafeSize(width - diff)
  },
  'top-left'() {
    map.top()
    map.left()
  },
  'top-right'() {
    map.top()
    map.right()
  },
  'bottom-left'() {
    map.bottom()
    map.left()
  },
  'bottom-right'() {
    map.bottom()
    map.right()
  },
}


const handleOffset = () => {
  const fn = map[state.type]
  typeof fn === 'function' && fn()
}
</script>
<style scoped lang="less">
.window-resize {
  user-select: none;
  position: absolute;
  left: 0;
  top: 0;
}

.top, .bottom {
  cursor: ns-resize;
  width: 100%;
  height: 2px;
}

.left, .right {
  cursor: ew-resize;
  width: 2px;
  height: 100%;
}

.bottom {
  top: auto;
  bottom: 0;
}

.right {
  cursor: ew-resize;
  left: auto;
  right: 0;
}

.top-left, .top-right, .bottom-left, .bottom-right {
  width: 4px;
  height: 4px;
}

.top-left {
  cursor: nw-resize;
}

.top-right {
  cursor: ne-resize;
  left: auto;
  right: 0;
}

.bottom-left {
  cursor: ne-resize;
  top: auto;
  bottom: 0;
}

.bottom-right {
  cursor: nw-resize;
  top: auto;
  left: auto;
  bottom: 0;
  right: 0;
}
</style>
