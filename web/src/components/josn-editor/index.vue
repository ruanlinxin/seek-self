<template>
  <a-tooltip position="right">
    <template #content>
      <pre>{{ showText }}</pre>
    </template>
    <a-button type="primary" @click="open">
      <slot>点击前往编辑</slot>
    </a-button>
  </a-tooltip>
  <a-modal v-model:visible="modalVisible" v-bind="modalProps" @beforeOk="handleOk">
    <div style="height: calc(100vh - 170px)" ref="domRef" :key="key"></div>
  </a-modal>
</template>
<script setup lang="ts">
import JSON5 from 'json5'
import {generateId} from '@seek-self/utils'
import {message} from "@/tools";
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'

if (!self.MonacoEnvironment) {
  self.MonacoEnvironment = {
    getWorkerUrl: () => `data:text/javascript;charset=utf-8,${encodeURIComponent(`
        self.MonacoEnvironment = {
          baseUrl: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/'
        };`)}`,
  };
}
const props = defineProps<{
  modelValue?: object
}>()
const emit = defineEmits(['update:modelValue'])

const modalProps = reactive({
  fullscreen: true,
  title: 'JSON编辑器'
})
const domRef = ref()
const modalVisible = ref(false)
const showText = computed(() => JSON.stringify(props.modelValue, null, 2))

const key = ref()
let instance
const open = () => {
  key.value = generateId('json-editor')
  modalVisible.value = true
  nextTick(() => {
    try {
      instance = monaco.editor.create(domRef.value, {
        theme: 'vs-dark',
        language: 'json',
        automaticLayout: true,
        value: showText.value
      })
    } catch {

    }
  }, 0)
}
const handleOk = () => {
  try {
    const res = JSON5.parse(instance.getValue())
    if (typeof res === 'object') {
      emit('update:modelValue', res)
      return true
    }
    return false
  } catch (e) {
    message.error(e.message)
    return false
  }
}


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
