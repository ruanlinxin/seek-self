/**
 * 任务管理模块类型定义
 */

// 任务类型枚举
export enum TaskType {
  MAIN = 'main',        // 主线任务
  SUB = 'sub',          // 支线任务
  DAILY = 'daily',      // 日常任务
  EVENT = 'event'       // 活动任务
}

// 任务状态枚举
export enum TaskStatus {
  PENDING = 'pending',         // 待处理
  IN_PROGRESS = 'in_progress', // 进行中
  COMPLETED = 'completed',     // 已完成
  OVERDUE = 'overdue',         // 已超时
  CANCELLED = 'cancelled'      // 已取消
}

// 任务基础接口
export interface Task {
  id: string;
  title: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  dueDate?: Date;
  cronExpression?: string;
  isRecurring: boolean;
  tags: TaskTag[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  userId: string;
}

// 任务标记接口
export interface TaskTag {
  id: string;
  taskId: string;
  key: string;
  value: string;
  createdAt: Date;
}

// 任务实例接口（循环任务生成的实例）
export interface TaskInstance {
  id: string;
  taskId: string;
  title: string;
  description?: string;
  dueDate?: Date;
  status: TaskStatus;
  scheduledDate: Date;
  completedAt?: Date;
  createdAt: Date;
}

// 扩展的任务接口（包含实例）
export interface TaskWithInstances extends Task {
  instances: TaskInstance[];
  upcomingInstances: TaskInstance[];
}

// === DTO 类型定义 ===

// 创建任务DTO
export interface CreateTaskDto {
  title: string;
  description?: string;
  type: TaskType;
  dueDate?: string;
  cronExpression?: string;
  tags?: Array<{
    key: string;
    value: string;
  }>;
}

// 更新任务DTO
export interface UpdateTaskDto {
  title?: string;
  description?: string;
  type?: TaskType;
  status?: TaskStatus;
  dueDate?: string;
  cronExpression?: string;
  tags?: Array<{
    id?: string;
    key: string;
    value: string;
  }>;
}

// 任务查询参数接口
export interface TaskQueryParams {
  type?: TaskType;
  status?: TaskStatus;
  keyword?: string;
  dueAfter?: string;
  dueBefore?: string;
  page?: number;
  limit?: number;
  includeInstances?: boolean;
}

// 任务列表响应接口
export interface TaskListResponse {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
}

// 任务统计接口
export interface TaskStatistics {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  tasksByType: Record<TaskType, number>;
}

// 删除任务响应接口
export interface DeleteTaskResponse {
  success: boolean;
  message: string;
}

// 完成任务响应接口
export interface CompleteTaskResponse {
  success: boolean;
  task: Task;
}

// 批量操作任务接口
export interface BatchUpdateTasksDto {
  taskIds: string[];
  action: 'complete' | 'delete' | 'updateStatus';
  status?: TaskStatus;
}

// 批量操作响应接口
export interface BatchTaskResponse {
  success: boolean;
  updatedCount: number;
  failedCount: number;
  errors?: string[];
}

// 任务实例生成参数接口
export interface GenerateInstancesDto {
  count?: number;
  startDate?: string;
  endDate?: string;
}

// 导出类型，用于 API 模块和其他地方使用
export type {
  Task as TaskInfo,
  TaskTag as TaskTagInfo,
  TaskInstance as TaskInstanceInfo,
  TaskWithInstances as TaskWithInstancesInfo
};