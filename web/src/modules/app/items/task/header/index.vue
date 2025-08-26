<template>
    <div class="task-header">
        <div class="header-content">
            <div class="header-left">
            </div>
            <div class="header-right">
                <a-button type="primary" @click="handleCreateTask">
                    <template #icon><icon-plus /></template>
                    创建任务
                </a-button>
            </div>
        </div>
    </div>

    <!-- 快速创建弹框 -->
    <QuickCreate
        v-model:visible="showQuickCreate"
        @success="handleCreateSuccess"
    />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'
import QuickCreate from '../components/quick-create.vue'

// 响应式数据
const showQuickCreate = ref(false)

// 事件处理器
const handleCreateTask = () => {
  showQuickCreate.value = true
}

const handleCreateSuccess = () => {
  // 创建成功后可以触发刷新事件给父组件
  // 这里可以根据需要添加更多逻辑
  console.log('任务创建成功')
}
</script>

<style scoped>
.task-header {
    background: white;
    border-bottom: 1px solid #e5e7eb;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
}

.header-left {
    flex: 1;
}

.page-title {
    font-size: 28px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 8px 0;
}

.page-subtitle {
    font-size: 16px;
    color: #6b7280;
    margin: 0;
}

.header-right {
    display: flex;
    gap: 12px;
}
</style>
