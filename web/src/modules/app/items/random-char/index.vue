<template>
  <div class="random-char">
    <a-form :model="{}">
      <a-form-item label="模式">
        <a-select :options="modelOptions" v-model="form.model"></a-select>
      </a-form-item>
      <a-form-item label="生成数量">
        <a-input-number v-model="form.count"/>
      </a-form-item>
      <a-form-item label="前缀">
        <a-input v-model="form.prefix"/>
      </a-form-item>
      <a-form-item label="后缀">
        <a-input v-model="form.suffix"/>
      </a-form-item>
      <template v-if="form.model === 'customerDict'">
        <a-form-item label="字典">
          <a-input placeholder="请输入" v-model="form.dict"></a-input>
        </a-form-item>
        <a-form-item label="字符串长度">
          <a-input placeholder="请输入" v-model="form.dictLength"></a-input>
        </a-form-item>
      </template>
      <a-form-item label="结果">
        <a-textarea :auto-size="{
          minRows:1,
          maxRows:8
        }" v-model="form.result"/>
      </a-form-item>
      <a-form-item>
        <a-space>
          <a-button type="primary" @click="handleGen">生成</a-button>
          <a-button type="primary" @click="copy" :disabled="!form.result">复制</a-button>
          <a-button type="primary" @click="download" :disabled="!form.result">下载到本地</a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>
<script setup lang="ts">
import {nanoid} from 'nanoid'
import {useClipboard} from "@/hooks";
import {message} from "@/tools";

const form = reactive({
  model: 'nanoid',
  count: 1,
  dict: '',
  dictLength: 8,
  result: '',
//   前缀
  prefix: '',
  // 后缀
  suffix: '',
})
const modelOptions = [
  {value: 'nanoid', label: 'nanoid'},
  {value: 'customerDict', label: '自定义字典'},
]


const gen = {
  nanoid() {
    return `${form.prefix || ''}${nanoid()}${form.suffix || ''}`
  },
  customerDict() {
    const list = [...new Set(form.dict.split(''))]
    if (list.length === 0) {
      return ''
    }
    
    const length = parseInt(form.dictLength) || 8
    let result = ''
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * list.length)
      result += list[randomIndex]
    }
    
    return result
  },
}

const handleGen = () => {
  const fn = gen[form.model]
  if (fn) {
    const arr = new Array(form.count).fill(null).map(fn)
    form.result = arr.join('\n')
  }
}
const copy = () => {
  const {copy} = useClipboard(form.result);
  copy().then(() => {
    message.success('复制成功')
  })
}

const download = () => {
  const blob = new Blob([form.result], {type: 'text/plain'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${new Date().toDateString()}-随机字符串.txt`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
