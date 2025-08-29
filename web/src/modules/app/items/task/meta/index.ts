import { inject, provide, ref } from 'vue'
import { TaskAPI, type CreateTaskDto, type UpdateTaskDto, type Task } from '@seek-self/api'
import { Message } from '@arco-design/web-vue'
import { createLogger } from '@seek-self/utils'

// 创建任务模块专用日志器
const logger = createLogger('Task')
// 设置日志级别为 debug 以显示更多信息
logger.setLevel('debug')

interface TaskContext {
  title: string
  description?: string
  type?: string
  onSuccess?: () => void
  onError?: (error: any) => void
}

interface UpdateTaskContext {
  taskId: string
  title?: string
  description?: string
  type?: string
  status?: string
  dueDate?: string
  cronExpression?: string
  tags?: Array<{
    id?: string
    key: string
    value: string
  }>
  onSuccess?: () => void
  onError?: (error: any) => void
}

export const injectTask = () => {
  const injected = inject('task')
  console.log('📍 injectTask 结果:', injected)
  return injected
}

export const useTask = () => {
  console.log('🔧 useTask 函数开始初始化')

  const creating = ref(false)
  const updating = ref(false)
  const loading = ref(false)
  const pendingTasks = ref<Task[]>([])
  const selectedTaskIds = ref<string[]>([])
  const selectedTask = ref<Task | null>(null)

  console.log('📊 初始状态:', {
    creating: creating.value,
    updating: updating.value,
    loading: loading.value,
    pendingTasksLength: pendingTasks.value.length,
    selectedTaskIdsLength: selectedTaskIds.value.length,
    selectedTask: selectedTask.value
  })

  // 获取所有未完成的任务
  const loadPendingTasks = async () => {
    try {
      loading.value = true
      logger.info('✨ 开始加载未完成任务')

      const queryParams = {
        status: 'pending,in_progress',
        limit: 100
      }
      logger.debug('⚡ 查询参数:', queryParams)

      const response = await TaskAPI.getTasks(queryParams)
      logger.debug('📡 API响应:', response)

      pendingTasks.value = response.data.tasks || []
      logger.info(`✅ 成功加载 ${pendingTasks.value.length} 个未完成任务`)

      // 显示任务详情
      if (pendingTasks.value.length > 0) {
        logger.debug('📋 任务列表:', pendingTasks.value.map((task: Task) => ({
          id: task.id,
          title: task.title,
          status: task.status,
          type: task.type
        })))
      } else {
        logger.warn('⚠️ 未找到任何未完成任务')
      }
    } catch (error) {
      logger.error('❌ 加载未完成任务失败:', error)
      pendingTasks.value = []
    } finally {
      loading.value = false
      logger.debug('🏁 加载操作完成')
    }
  }

  // 选择任务（单选模式）
  const selectTask = (taskId: string) => {
    logger.debug(`🎯 选择任务请求: ${taskId}`)

    // 如果已经选中该任务，则取消选择
    if (selectedTaskIds.value.includes(taskId)) {
      clearSelection()
      return
    }

    // 选中新任务（单选）
    selectedTaskIds.value = [taskId]

    // 更新选中任务详情
    const task = pendingTasks.value.find((task: Task) => task.id === taskId)
    selectedTask.value = task || null

    logger.info(`✅ 已选中任务: ${task?.title || taskId}`)
    logger.debug('📋 选中任务详情:', selectedTask.value)
  }

  // 清空选择
  const clearSelection = () => {
    selectedTaskIds.value = []
    selectedTask.value = null
    logger.info('🧹 已清空任务选择')
  }

  // 获取选中任务的详情
  const getSelectedTask = () => {
    return selectedTask.value
  }

  // 获取选中任务的名称
  const getSelectedTaskName = () => {
    return selectedTask.value?.title || ''
  }

  // 检查任务是否被选中
  const isTaskSelected = (taskId: string) => {
    return selectedTaskIds.value.includes(taskId)
  }

  // 创建任务函数
  const createTask = async (context: TaskContext) => {
    if (!context.title?.trim()) {
      logger.warn('❌ 任务创建失败: 标题为空')
      Message.error('任务标题不能为空')
      return false
    }

    try {
      creating.value = true
      logger.info(`🚀 开始创建任务: ${context.title}`)

      const taskData: CreateTaskDto = {
        title: context.title.trim(),
        description: context.description || '',
        type: (context.type as any) || 'main'
      }
      logger.debug('📄 任务数据:', taskData)

      const result = await TaskAPI.createTask(taskData)
      logger.debug('✅ 创建结果:', result)

      logger.info(`✨ 任务创建成功: ${context.title}`)
      Message.success('任务创建成功')
      context.onSuccess?.()

      // 重新加载未完成任务列表
      logger.debug('🔄 即将重新加载未完成任务列表')
      await loadPendingTasks()

      // 自动选中新创建的任务
      if (result?.data?.id) {
        logger.debug('🎯 自动选中新创建的任务:', result.data.id)
        selectTask(result.data.id)
      } else {
        logger.warn('⚠️ 创建任务成功但无法获取任务ID:', result)
      }

      return true
    } catch (error) {
      logger.error('❌ 创建任务失败:', error)
      context.onError?.(error)
      return false
    } finally {
      creating.value = false
      logger.debug('🏁 创建操作完成')
    }
  }

  // 更新任务函数
  const updateTask = async (context: UpdateTaskContext) => {
    if (!context.taskId) {
      logger.warn('❌ 任务更新失败: 任务ID为空')
      Message.error('任务ID不能为空')
      return false
    }

    try {
      updating.value = true
      logger.info(`🔧 开始更新任务: ${context.taskId}`)

      const updateData: UpdateTaskDto = {}

      // 只更新提供的字段
      if (context.title !== undefined) updateData.title = context.title.trim()
      if (context.description !== undefined) updateData.description = context.description
      if (context.type !== undefined) updateData.type = context.type as any
      if (context.status !== undefined) updateData.status = context.status as any
      if (context.dueDate !== undefined) updateData.dueDate = context.dueDate
      if (context.cronExpression !== undefined) updateData.cronExpression = context.cronExpression
      if (context.tags !== undefined) updateData.tags = context.tags

      logger.debug('📝 更新数据:', updateData)

      const result = await TaskAPI.updateTask(context.taskId, updateData)
      logger.debug('✅ 更新结果:', result)

      logger.info(`✨ 任务更新成功: ${context.taskId}`)
      Message.success('任务更新成功')
      context.onSuccess?.()

      // 重新加载未完成任务列表
      logger.debug('🔄 即将重新加载未完成任务列表')
      await loadPendingTasks()

      // 如果更新的是当前选中的任务，更新选中任务信息
      if (selectedTask.value?.id === context.taskId) {
        const updatedTask = pendingTasks.value.find((task: Task) => task.id === context.taskId)
        selectedTask.value = updatedTask || null
        logger.debug('🔄 已更新选中任务信息:', selectedTask.value)
      }

      return true
    } catch (error) {
      logger.error('❌ 更新任务失败:', error)
      Message.error('更新任务失败')
      context.onError?.(error)
      return false
    } finally {
      updating.value = false
      logger.debug('🏁 更新操作完成')
    }
  }

  const res = {
    // 任务创建
    createTask,
    creating,

    // 任务更新
    updateTask,
    updating,

    // 未完成任务管理
    loadPendingTasks,
    pendingTasks,
    loading,

    // 任务选择
    selectTask,
    clearSelection,
    getSelectedTask,
    getSelectedTaskName,
    isTaskSelected,
    selectedTaskIds,
    selectedTask
  }

  console.log('📦 provide task 对象:', res)
  provide('task', res)
  console.log('✅ provide 完成')

  return res
}
