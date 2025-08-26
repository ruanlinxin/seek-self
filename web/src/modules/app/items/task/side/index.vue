<template>
  <div class="task-side-panel">
      <div class="pending-tasks-content">
        <!-- 加载状态 -->
        <div v-if="loading && (!pendingTasks || pendingTasks.length === 0)" class="loading-state">
          <a-spin size="small" />
          <span>加载中...</span>
        </div>

        <!-- 空状态 -->
        <div v-else-if="!pendingTasks || pendingTasks.length === 0" class="empty-state">
          <icon-file />
          <span>暂无未完成任务</span>
        </div>

        <!-- 任务列表 -->
        <div v-else class="task-list">
          <div
            v-for="task in pendingTasks"
            :key="task.id"
            class="task-item"
            :class="{ 'task-selected': isTaskSelected(task.id) }"
            @click="handleTaskSelect(task.id)"
          >
            <div class="task-info">
              <div class="task-title">{{ task.title }}</div>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { type TaskQueryParams } from '@seek-self/api'
import { injectTask } from '../meta/index'
import {
  IconFilter,
  IconApps,
  IconClockCircle,
  IconLoading,
  IconCheckCircle,
  IconExclamationCircle,
  IconList,
  IconRefresh,
  IconFile
} from '@arco-design/web-vue/es/icon'

// Props & Emits
const emit = defineEmits<{
  filterChange: [filters: Partial<TaskQueryParams>]
}>()

// 注入任务管理功能
const taskManager = injectTask() as any

// 直接引用taskManager中的响应式数据，确保响应式连接
const pendingTasks = taskManager?.pendingTasks
const loading = taskManager?.loading
const selectedTaskIds = taskManager?.selectedTaskIds

// 任务管理方法
const loadPendingTasks = taskManager?.loadPendingTasks
const selectTask = taskManager?.selectTask
const clearSelection = taskManager?.clearSelection
const isTaskSelected = taskManager?.isTaskSelected

// 响应式数据
const selectedStatus = ref('')
const selectedTypes = ref<string[]>(['main', 'sub', 'daily', 'event'])

// 方法
const handleStatusFilter = (key: string) => {
  selectedStatus.value = key
  emit('filterChange', {
    status: key || undefined,
    page: 1
  })
}

const handleTypeFilter = () => {
  // 如果没有选择任何类型，则不应用类型筛选
  const typeFilter = selectedTypes.value.length === 4 ? undefined : selectedTypes.value
  emit('filterChange', {
    type: typeFilter?.[0], // 暂时只支持单个类型筛选
    page: 1
  })
}

// 任务选择相关方法
const handleTaskSelect = (taskId: string) => {
  if (selectTask) {
    selectTask(taskId)
  }
}

const clearTaskSelection = () => {
  if (clearSelection) {
    clearSelection()
  }
}

const refreshPendingTasks = () => {
  if (loadPendingTasks) {
    loadPendingTasks()
  }
}

// 获取类型标签
const getTypeLabel = (type: string): string => {
  const labelMap: Record<string, string> = {
    'main': '主线',
    'sub': '支线',
    'daily': '日常',
    'event': '活动'
  }
  return labelMap[type] || type
}

// 获取状态标签
const getStatusLabel = (status: string): string => {
  const labelMap: Record<string, string> = {
    'pending': '待处理',
    'in_progress': '进行中',
    'completed': '已完成',
    'overdue': '已超时'
  }
  return labelMap[status] || status
}

// 组件挂载时加载未完成任务
onMounted(() => {
  console.log('🔄 侧边栏组件挂载')
  console.log('📊 taskManager:', taskManager)
  console.log('📊 pendingTasks:', pendingTasks)
  console.log('📊 loading:', loading)
  console.log('📊 loadPendingTasks:', loadPendingTasks)

  if (loadPendingTasks) {
    console.log('⚙️ 开始加载未完成任务')
    loadPendingTasks()
  } else {
    console.error('❌ loadPendingTasks 方法不存在')
  }
})
</script>

<style scoped>
.task-side-panel {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 筛选卡片 */
.filter-card {
  flex-shrink: 0;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.filter-content {
  padding: 0;
}

.filter-menu {
  border: none;
  background: transparent;
}

.filter-menu :deep(.arco-menu-item) {
  border-radius: 6px;
  margin-bottom: 4px;
}

.filter-section {
  margin-top: 16px;
}

.filter-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.filter-section :deep(.arco-checkbox) {
  margin-bottom: 8px;
}

/* 未完成任务卡片 */
.pending-tasks-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pending-tasks-card :deep(.arco-card-body) {
  flex: 1;
  padding: 0;
  overflow: hidden;
}

.task-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.pending-tasks-content {
  display: flex;
  flex-direction: column;
}

/* 加载和空状态 */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #9ca3af;
  gap: 8px;
}

.empty-state {
  font-size: 14px;
}

/* 任务列表 */
.task-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.task-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  margin-bottom: 4px;
}

.task-item:hover {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.task-item.task-selected {
  background: #eff6ff;
  border-color: #3b82f6;
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  word-break: break-word;
  line-height: 1.3;
}

/* 选中信息 */
.selection-summary {
  padding: 12px 16px;
  background: #f0f9ff;
  border-top: 1px solid #e0f2fe;
  font-size: 13px;
  color: #0369a1;
  text-align: center;
  border-radius: 0 0 8px 8px;
}
</style>
