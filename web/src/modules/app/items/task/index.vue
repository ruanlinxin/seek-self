<template>
  <div class="task-management-page">
    <div class="header-panel">
      <TaskHeaderPanel/>
    </div>
    <div class="body-panel">
      <!-- 左侧面板 - 固定宽度 -->
      <div class="left-panel">
        <TaskSidePanel @filter-change="handleFilterChange"/>
      </div>

      <!-- 右侧主内容区域 - 占据剩余空间 -->
      <div class="right-panel">
        <TaskDetailPanel
            :tasks="tasks"
            :loading="loading"
            :total-tasks="totalTasks"
            :filter-params="filterParams"
            @create-task="handleCreateTask"
            @edit-task="handleEditTask"
            @delete-task="handleDeleteTask"
            @complete-task="handleCompleteTask"
            @refresh="handleRefresh"
        />
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted} from 'vue'
import {TaskAPI, type Task, type TaskQueryParams} from '@seek-self/api'
import TaskSidePanel from './side/index.vue'
import TaskDetailPanel from './detail/index.vue'
import TaskHeaderPanel from './header/index.vue'
import {useTask} from './meta/index'

// 初始化任务管理
const {createTask, creating} = useTask()
console.log('🚀 主页面 useTask 初始化完成:', {createTask, creating})

// 响应式数据
const tasks = ref<Task[]>([])
const totalTasks = ref(0)
const loading = ref(false)
const showTaskForm = ref(false)
const editingTask = ref<Task | null>(null)

// 筛选参数
const filterParams = reactive<TaskQueryParams>({
  page: 1,
  limit: 20
})

// 加载任务列表
const loadTasks = async () => {
  try {
    loading.value = true
    const response = await TaskAPI.getTasks(filterParams)
    tasks.value = response.tasks
    totalTasks.value = response.total
  } catch (error) {
    console.error('加载任务失败:', error)
  } finally {
    loading.value = false
  }
}

// 事件处理器
const handleFilterChange = (newFilters: Partial<TaskQueryParams>) => {
  Object.assign(filterParams, newFilters, {page: 1})
  loadTasks()
}

const handleCreateTask = () => {
  editingTask.value = null
  showTaskForm.value = true
}

const handleEditTask = (task: Task) => {
  editingTask.value = task
  showTaskForm.value = true
}

const handleDeleteTask = async (taskId: string) => {
  try {
    await TaskAPI.deleteTask(taskId)
    await loadTasks()
  } catch (error) {
    console.error('删除任务失败:', error)
  }
}

const handleCompleteTask = async (taskId: string) => {
  try {
    await TaskAPI.completeTask(taskId)
    await loadTasks()
  } catch (error) {
    console.error('完成任务失败:', error)
  }
}

const handleTaskSubmit = async () => {
  showTaskForm.value = false
  editingTask.value = null
  await loadTasks()
}

const handleTaskFormCancel = () => {
  showTaskForm.value = false
  editingTask.value = null
}

const handleRefresh = () => {
  loadTasks()
}

// 组件挂载时加载数据
onMounted(() => {
  loadTasks()
})
</script>

<style scoped lang="less">
.task-management-page {
  display: flex;
  height: 100%;
  flex-direction: column;
  overflow: auto;

  .header-panel {
    /* 移除边框，使界面更紧凑 */
  }

  .body-panel {
    flex: 1;
    display: flex;
    overflow: auto;
    flex-direction: row;
    /* 左侧面板 - 固定宽度 */

    .left-panel {
      width: 280px;
      flex-shrink: 0;
      border-right: 1px solid #e5e7eb;
      overflow-y: auto;
    }

    /* 右侧面板 - 占据剩余空间 */

    .right-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
  }
}

</style>
