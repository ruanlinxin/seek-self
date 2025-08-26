<template>
  <a-modal
    v-model:visible="modalVisible"
    hide-title
    width="420px"
    :footer="false"
    :mask-closable="true"
    unmount-on-close
    @cancel="handleCancel"
    class="quick-create-modal"
  >
    <div class="quick-create-content">
      <!-- 主输入区域 -->
      <div class="search-box">
        <div class="search-input-wrapper">
          <a-input
            ref="inputRef"
            v-model="taskTitle"
            placeholder="输入任务标题并按回车创建..."
            size="large"
            :max-length="200"
            :bordered="false"
            @keyup.enter="handleCreate"
            @keyup.esc="handleCancel"
            class="search-input"
          />
          <div v-if="taskTitle.trim()" class="clear-btn" @click="clearInput">
            <icon-close />
          </div>
        </div>
      </div>

      <!-- 状态提示 -->
      <div v-if="creating" class="status-text">
        正在创建任务...
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { injectTask } from '../meta/index'
import { IconPlus, IconClose } from '@arco-design/web-vue/es/icon'

// Props
interface Props {
  visible: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false
})

// Emits
const emit = defineEmits<{
  'update:visible': [visible: boolean]
  'success': []
}>()

// 注入任务管理功能
const taskManager = injectTask() as any
const { createTask, creating } = taskManager || {}

// 模态框可见性
const modalVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// 响应式数据
const taskTitle = ref('')
const inputRef = ref()

const clearInput = () => {
  taskTitle.value = ''
}

// 方法
const handleCreate = async () => {
  if (!taskTitle.value.trim() || !createTask) {
    return
  }

  const success = await createTask({
    title: taskTitle.value,
    type: 'main',
    onSuccess: () => {
      taskTitle.value = ''
      modalVisible.value = false
      emit('success')
    },
    onError: (error: any) => {
      console.error('快速创建任务失败:', error)
    }
  })
}

const handleCancel = () => {
  taskTitle.value = ''
  modalVisible.value = false
}

// 监听模态框打开，自动聚焦输入框
watch(() => props.visible, (visible) => {
  if (visible) {
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
})
</script>

<style scoped>

/* 内容区域 */
.quick-create-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 搜索框样式 */
.search-box {
  position: relative;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 10px 12px;
  transition: all 0.2s ease;
}

.search-input-wrapper:hover {
  border-color: #dee2e6;
  background: #f1f3f4;
}

.search-input-wrapper:focus-within {
  border-color: #4285f4;
  background: white;
  box-shadow: 0 1px 6px rgba(66, 133, 244, 0.2);
}


.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  color: #202124;
}


.clear-btn {
  color: #9aa0a6;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s ease;
  margin-left: 8px;
}

.clear-btn:hover {
  color: #5f6368;
  background: #f1f3f4;
}

/* 状态文本 */
.status-text {
  text-align: center;
  color: #9aa0a6;
  font-size: 14px;
  padding: 8px 0;
}
</style>
