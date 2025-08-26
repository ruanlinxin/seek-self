/**
 * 任务管理模块 API
 * 提供任务的创建、查询、更新、删除等功能
 */

import { request } from '../index';
import type { Result } from '@seek-self/types';
import type {
  Task,
  TaskType,
  TaskStatus,
  TaskTag,
  TaskInstance,
  TaskWithInstances,
  CreateTaskDto,
  UpdateTaskDto,
  TaskQueryParams,
  TaskListResponse,
  TaskStatistics,
  DeleteTaskResponse,
  CompleteTaskResponse,
  BatchUpdateTasksDto,
  BatchTaskResponse,
  GenerateInstancesDto
} from '@seek-self/types';

// ==================== 导入和类型导出 ====================
export type {
  Task,
  TaskType,
  TaskStatus,
  TaskTag,
  TaskInstance,
  TaskWithInstances,
  CreateTaskDto,
  UpdateTaskDto,
  TaskQueryParams,
  TaskListResponse,
  TaskStatistics,
  DeleteTaskResponse,
  CompleteTaskResponse,
  BatchUpdateTasksDto,
  BatchTaskResponse,
  GenerateInstancesDto
} from '@seek-self/types';

// ==================== API 函数定义 ====================

/**
 * 获取任务列表
 */
export const getTasks = (params?: TaskQueryParams): Result<TaskListResponse> => {
  return request({
    url: '/tasks',
    method: 'GET',
    params
  });
};

/**
 * 创建新任务
 */
export const createTask = (data: CreateTaskDto): Result<Task> => {
  return request({
    url: '/tasks',
    method: 'POST',
    data
  });
};

/**
 * 获取任务详情
 */
export const getTaskById = (id: string, includeInstances = false): Result<TaskWithInstances> => {
  return request({
    url: `/tasks/${id}`,
    method: 'GET',
    params: { includeInstances }
  });
};

/**
 * 更新任务
 */
export const updateTask = (id: string, data: UpdateTaskDto): Result<Task> => {
  return request({
    url: `/tasks/${id}`,
    method: 'PUT',
    data
  });
};

/**
 * 删除任务
 */
export const deleteTask = (id: string): Result<DeleteTaskResponse> => {
  return request({
    url: `/tasks/${id}`,
    method: 'DELETE'
  });
};

/**
 * 完成任务
 */
export const completeTask = (id: string): Result<CompleteTaskResponse> => {
  return request({
    url: `/tasks/${id}/complete`,
    method: 'POST'
  });
};

/**
 * 取消任务
 */
export const cancelTask = (id: string): Result<Task> => {
  return request({
    url: `/tasks/${id}/cancel`,
    method: 'POST'
  });
};

/**
 * 重新激活任务
 */
export const reactivateTask = (id: string): Result<Task> => {
  return request({
    url: `/tasks/${id}/reactivate`,
    method: 'POST'
  });
};

/**
 * 获取任务统计信息
 */
export const getTaskStatistics = (): Result<TaskStatistics> => {
  return request({
    url: '/tasks/statistics',
    method: 'GET'
  });
};

/**
 * 生成循环任务实例
 */
export const generateTaskInstances = (id: string, params?: GenerateInstancesDto): Result<TaskInstance[]> => {
  return request({
    url: `/tasks/${id}/instances`,
    method: 'POST',
    data: params
  });
};

/**
 * 获取任务实例列表
 */
export const getTaskInstances = (id: string): Result<TaskInstance[]> => {
  return request({
    url: `/tasks/${id}/instances`,
    method: 'GET'
  });
};

/**
 * 完成任务实例
 */
export const completeTaskInstance = (taskId: string, instanceId: string): Result<TaskInstance> => {
  return request({
    url: `/tasks/${taskId}/instances/${instanceId}/complete`,
    method: 'POST'
  });
};

/**
 * 批量更新任务
 */
export const batchUpdateTasks = (data: BatchUpdateTasksDto): Result<BatchTaskResponse> => {
  return request({
    url: '/tasks/batch',
    method: 'PUT',
    data
  });
};

/**
 * 获取超时任务列表
 */
export const getOverdueTasks = (): Result<Task[]> => {
  return request({
    url: '/tasks/overdue',
    method: 'GET'
  });
};

/**
 * 获取今日任务
 */
export const getTodayTasks = (): Result<Task[]> => {
  return request({
    url: '/tasks/today',
    method: 'GET'
  });
};

/**
 * 获取本周任务
 */
export const getWeekTasks = (): Result<Task[]> => {
  return request({
    url: '/tasks/week',
    method: 'GET'
  });
};

/**
 * 搜索任务
 */
export const searchTasks = (keyword: string): Result<Task[]> => {
  return request({
    url: '/tasks/search',
    method: 'GET',
    params: { keyword }
  });
};

/**
 * 根据类型获取任务
 */
export const getTasksByType = (type: TaskType): Result<Task[]> => {
  return request({
    url: `/tasks/type/${type}`,
    method: 'GET'
  });
};

/**
 * 根据状态获取任务
 */
export const getTasksByStatus = (status: TaskStatus): Result<Task[]> => {
  return request({
    url: `/tasks/status/${status}`,
    method: 'GET'
  });
};

// ==================== API 类引用 ====================

export class TaskAPI {
  // 基础CRUD操作
  static getTasks = getTasks;
  static createTask = createTask;
  static getTaskById = getTaskById;
  static updateTask = updateTask;
  static deleteTask = deleteTask;

  // 任务状态操作
  static completeTask = completeTask;
  static cancelTask = cancelTask;
  static reactivateTask = reactivateTask;

  // 任务统计和查询
  static getTaskStatistics = getTaskStatistics;
  static getOverdueTasks = getOverdueTasks;
  static getTodayTasks = getTodayTasks;
  static getWeekTasks = getWeekTasks;
  static searchTasks = searchTasks;
  static getTasksByType = getTasksByType;
  static getTasksByStatus = getTasksByStatus;

  // 循环任务实例管理
  static generateTaskInstances = generateTaskInstances;
  static getTaskInstances = getTaskInstances;
  static completeTaskInstance = completeTaskInstance;

  // 批量操作
  static batchUpdateTasks = batchUpdateTasks;
}

// 默认导出
export default TaskAPI;
