<template>
  <div class="task-detail-panel">
    <!-- 空状态：没有选中任务 -->
    <div v-if="!selectedTask" class="empty-state">
      <a-empty description="请从左侧选择一个任务查看详情">
        <template #image>
          <icon-file />
        </template>
      </a-empty>
    </div>
    
    <!-- 任务详情 -->
    <div v-else class="task-detail-content">
      <!-- 任务头部 -->
      <div class="task-header">
        <div class="task-meta">
          <span class="task-type" :class="`type-${selectedTask.type}`">
            {{ getTypeLabel(selectedTask.type) }}
          </span>
          <span class="task-status" :class="`status-${selectedTask.status}`">
            {{ getStatusLabel(selectedTask.status) }}
          </span>
        </div>
        
        <div class="task-actions">
          <template v-if="isEditing">
            <a-button 
              type="primary"
              size="small"
              :loading="updating"
              @click="handleSaveTask"
            >
              <template #icon><icon-save /></template>
              保存
            </a-button>
            <a-button 
              size="small"
              @click="handleCancelEdit"
            >
              <template #icon><icon-undo /></template>
              取消
            </a-button>
          </template>
          <template v-else>
            <a-button 
              v-if="selectedTask.status !== 'completed'" 
              type="primary"
              size="small"
              @click="handleCompleteTask"
            >
              <template #icon><icon-check-circle /></template>
              完成
            </a-button>
            <a-button size="small" @click="handleEditTask">
              <template #icon><icon-edit /></template>
              编辑
            </a-button>
            <a-button status="warning" size="small" @click="handleCancelTask">
              <template #icon><icon-close /></template>
              取消
            </a-button>
          </template>
        </div>
      </div>
      
      <!-- 任务标题 -->
      <div class="task-title-section">
        <h3 class="section-title">任务标题</h3>
        <div v-if="isEditing" class="edit-field">
          <a-input 
            v-model="editForm.title"
            placeholder="请输入任务标题"
            size="large"
            :max-length="200"
            show-word-limit
          />
        </div>
        <h1 v-else class="task-title">{{ selectedTask.title }}</h1>
      </div>
      
      <!-- 任务类型和截止时间 -->
      <div v-if="isEditing" class="task-meta-section">
        <h3 class="section-title">任务信息</h3>
        <div class="edit-row">
          <div class="edit-field">
            <label>任务类型：</label>
            <a-select v-model="editForm.type" placeholder="请选择任务类型">
              <a-option value="main">主线任务</a-option>
              <a-option value="sub">支线任务</a-option>
              <a-option value="daily">日常任务</a-option>
              <a-option value="event">活动任务</a-option>
            </a-select>
          </div>
          <div class="edit-field">
            <label>截止时间：</label>
            <a-date-picker
              v-model="editForm.dueDate"
              show-time
              format="YYYY-MM-DD HH:mm"
              placeholder="请选择截止时间"
              style="width: 100%"
            />
          </div>
        </div>
        <div v-if="editForm.type === 'daily'" class="edit-field">
          <label>Cron表达式：</label>
          <a-input 
            v-model="editForm.cronExpression"
            placeholder="请输入Cron表达式（可选）"
          />
        </div>
      </div>
      
      <!-- 任务描述 -->
      <div class="task-description-section">
        <h3 class="section-title">
          描述
        </h3>
        <div v-if="isEditing" class="edit-field">
          <a-textarea
            v-model="editForm.description"
            placeholder="请输入任务描述"
            :max-length="1000"
            :auto-size="{ minRows: 3, maxRows: 6 }"
            show-word-limit
          />
        </div>
        <div v-else-if="selectedTask.description" class="task-description">
          {{ selectedTask.description }}
        </div>
        <div v-else class="empty-description">
          暂无描述
        </div>
      </div>
      
      <!-- 时间信息 -->
      <div class="task-time-section">
        <h3 class="section-title">
          <icon-clock-circle />
          时间信息
        </h3>
        <div class="time-info">
          <div class="time-item">
            <label>创建时间：</label>
            <span>{{ formatDate(selectedTask.createdAt) }}</span>
          </div>
          <div v-if="selectedTask.updatedAt" class="time-item">
            <label>更新时间：</label>
            <span>{{ formatDate(selectedTask.updatedAt) }}</span>
          </div>
          <div v-if="selectedTask.dueDate" class="time-item">
            <label>截止时间：</label>
            <span class="due-date" :class="{ 'overdue': isDueDateOverdue }">
              {{ formatDate(selectedTask.dueDate) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Modal, Message } from '@arco-design/web-vue'
import { injectTask } from '../meta/index'
import {
  IconFile,
  IconCheckCircle,
  IconEdit,
  IconClose,
  IconClockCircle,
  IconSave,
  IconUndo
} from '@arco-design/web-vue/es/icon'

// 注入任务管理功能
const taskManager = injectTask() as any
const selectedTask = taskManager?.selectedTask
const updateTask = taskManager?.updateTask
const updating = taskManager?.updating

// 编辑状态
const isEditing = ref(false)
const editForm = ref({
  title: '',
  description: '',
  type: 'main',
  dueDate: '',
  cronExpression: ''
})

// 计算属性
const isDueDateOverdue = computed(() => {
  if (!selectedTask?.value?.dueDate) return false
  return new Date(selectedTask.value.dueDate) < new Date()
})

// 方法
const handleCompleteTask = () => {
  if (!selectedTask?.value) return
  
  Modal.confirm({
    title: '确认完成',
    content: `确定要完成任务"${selectedTask.value.title}"吗？`,
    onOk: () => {
      console.log('完成任务:', selectedTask.value.id)
      Message.success('任务已完成')
      // 这里可以调用API完成任务
    }
  })
}

const handleEditTask = () => {
  if (!selectedTask?.value) return
  
  // 初始化编辑表单数据
  editForm.value = {
    title: selectedTask.value.title || '',
    description: selectedTask.value.description || '',
    type: selectedTask.value.type || 'main',
    dueDate: selectedTask.value.dueDate ? formatDateForInput(selectedTask.value.dueDate) : '',
    cronExpression: selectedTask.value.cronExpression || ''
  }
  
  isEditing.value = true
  console.log('进入编辑模式:', editForm.value)
}

const handleSaveTask = async () => {
  if (!selectedTask?.value || !updateTask) return
  
  try {
    const success = await updateTask({
      taskId: selectedTask.value.id,
      title: editForm.value.title,
      description: editForm.value.description,
      type: editForm.value.type,
      dueDate: editForm.value.dueDate || undefined,
      cronExpression: editForm.value.cronExpression || undefined,
      onSuccess: () => {
        isEditing.value = false
        // meta/index.ts 中已经有成功提示，这里不再重复
      },
      onError: (error: any) => {
        console.error('更新任务失败:', error)
        // meta/index.ts 中已经有错误提示，这里不再重复
      }
    })
  } catch (error) {
    console.error('保存任务失败:', error)
    Message.error('保存任务失败')
  }
}

const handleCancelEdit = () => {
  isEditing.value = false
  // 重置表单数据
  editForm.value = {
    title: '',
    description: '',
    type: 'main',
    dueDate: '',
    cronExpression: ''
  }
}

const handleCancelTask = () => {
  if (!selectedTask?.value) return
  
  Modal.confirm({
    title: '确认取消',
    content: `确定要取消任务"${selectedTask.value.title}"吗？取消后任务状态将变为已取消。`,
    onOk: () => {
      console.log('取消任务:', selectedTask.value.id)
      Message.success('任务已取消')
      // 这里可以调用API取消任务（将状态设置为cancelled）
    }
  })
}

// 工具函数
const formatDateForInput = (date: Date | string): string => {
  const d = new Date(date)
  return d.toISOString().slice(0, 16) // 格式为 YYYY-MM-DDTHH:mm
}

const getTypeLabel = (type: string): string => {
  const labelMap: Record<string, string> = {
    'main': '主线任务',
    'sub': '支线任务', 
    'daily': '日常任务',
    'event': '活动任务'
  }
  return labelMap[type] || type
}

const getStatusLabel = (status: string): string => {
  const labelMap: Record<string, string> = {
    'pending': '待处理',
    'in_progress': '进行中',
    'completed': '已完成',
    'overdue': '已超时',
    'cancelled': '已取消'
  }
  return labelMap[status] || status
}

const formatDate = (date: Date | string): string => {
  const d = new Date(date)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.task-detail-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
}

/* 任务详情内容 */
.task-detail-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

/* 任务头部 */
.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.task-meta {
  display: flex;
  gap: 12px;
  align-items: center;
}

.task-type,
.task-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.task-type.type-main {
  background: #dbeafe;
  color: #1e40af;
}

.task-type.type-sub {
  background: #ede9fe;
  color: #6d28d9;
}

.task-type.type-daily {
  background: #fef3c7;
  color: #92400e;
}

.task-type.type-event {
  background: #fee2e2;
  color: #991b1b;
}

.task-status.status-pending {
  background: #f3f4f6;
  color: #6b7280;
}

.task-status.status-in_progress {
  background: #dbeafe;
  color: #2563eb;
}

.task-status.status-completed {
  background: #d1fae5;
  color: #065f46;
}

.task-status.status-overdue {
  background: #fee2e2;
  color: #991b1b;
}

.task-actions {
  display: flex;
  gap: 6px;
}

/* 任务标题区域 */
.task-title-section {
  padding: 16px;
  background: white;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.task-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  line-height: 1.3;
}

/* 其他内容区域 */
.task-description-section,
.task-time-section {
  padding: 16px;
  background: white;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
}

/* 任务描述 */
.task-description {
  color: #6b7280;
  line-height: 1.5;
  white-space: pre-wrap;
  font-size: 13px;
}

/* 时间信息 */
.time-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.time-item {
  display: flex;
  align-items: center;
}

.time-item label {
  font-weight: 500;
  color: #374151;
  width: 70px;
  flex-shrink: 0;
  font-size: 13px;
}

.time-item span {
  color: #6b7280;
  font-size: 13px;
}

.due-date.overdue {
  color: #dc2626;
  font-weight: 500;
}

/* 编辑模式样式 */
.task-meta-section {
  padding: 16px;
  background: white;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.edit-field {
  margin-bottom: 12px;
}

.edit-field label {
  display: inline-block;
  width: 80px;
  font-weight: 500;
  color: #374151;
  font-size: 13px;
  margin-bottom: 4px;
}

.edit-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.empty-description {
  color: #9ca3af;
  font-style: italic;
  font-size: 13px;
}

/* 编辑模式下的表单样式 */
.edit-field .arco-input,
.edit-field .arco-textarea,
.edit-field .arco-select,
.edit-field .arco-picker {
  width: 100%;
}

.edit-field .arco-select {
  min-width: 150px;
}</style>