import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, In } from 'typeorm';
import { Task } from './entities/task.entity';
import { TaskTag } from './entities/task-tag.entity';
import { TaskInstance } from './entities/task-instance.entity';
import { 
  CreateTaskDto, 
  UpdateTaskDto, 
  TaskQueryDto, 
  TaskStatus, 
  TaskType,
  BatchUpdateTasksDto,
  GenerateInstancesDto
} from './dto/task.dto';
import * as cron from 'node-cron';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(TaskTag)
    private taskTagRepository: Repository<TaskTag>,
    @InjectRepository(TaskInstance)
    private taskInstanceRepository: Repository<TaskInstance>
  ) {}

  /**
   * 获取用户任务列表
   */
  async findUserTasks(userId: string, queryDto: TaskQueryDto) {
    const { type, status, keyword, dueAfter, dueBefore, page = 1, limit = 20, includeInstances = false } = queryDto;
    
    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.tags', 'tags')
      .where('task.userId = :userId', { userId })
      .andWhere('task.deletedAt IS NULL');

    if (includeInstances) {
      queryBuilder.leftJoinAndSelect('task.instances', 'instances');
    }

    if (type) {
      queryBuilder.andWhere('task.type = :type', { type });
    }

    if (status) {
      // 支持单个状态或逗号分隔的多个状态
      const statusList = status.split(',').map(s => s.trim()).filter(s => s);
      if (statusList.length === 1) {
        queryBuilder.andWhere('task.status = :status', { status: statusList[0] });
      } else if (statusList.length > 1) {
        queryBuilder.andWhere('task.status IN (:...statusList)', { statusList });
      }
    }

    if (keyword) {
      queryBuilder.andWhere(
        '(task.title LIKE :keyword OR task.description LIKE :keyword)',
        { keyword: `%${keyword}%` }
      );
    }

    if (dueAfter) {
      queryBuilder.andWhere('task.dueDate >= :dueAfter', { dueAfter });
    }

    if (dueBefore) {
      queryBuilder.andWhere('task.dueDate <= :dueBefore', { dueBefore });
    }

    const [tasks, total] = await queryBuilder
      .orderBy('task.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      tasks,
      total,
      page,
      limit
    };
  }

  /**
   * 创建任务
   */
  async createTask(userId: string, createTaskDto: CreateTaskDto) {
    const { tags = [], cronExpression, ...taskData } = createTaskDto;
    
    // 验证 cron 表达式
    if (cronExpression && !cron.validate(cronExpression)) {
      throw new BadRequestException('Invalid cron expression');
    }

    // 创建任务
    const task = this.taskRepository.create({
      ...taskData,
      userId,
      cronExpression,
      isRecurring: !!cronExpression,
      status: TaskStatus.PENDING
    });

    const savedTask = await this.taskRepository.save(task);

    // 创建标记
    if (tags.length > 0) {
      const taskTags = tags.map(tag => 
        this.taskTagRepository.create({
          ...tag,
          taskId: savedTask.id
        })
      );
      await this.taskTagRepository.save(taskTags);
    }

    return this.findTaskById(userId, savedTask.id, false);
  }

  /**
   * 根据ID获取任务详情
   */
  async findTaskById(userId: string, taskId: string, includeInstances = false) {
    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.tags', 'tags')
      .where('task.id = :taskId', { taskId })
      .andWhere('task.userId = :userId', { userId })
      .andWhere('task.deletedAt IS NULL');

    if (includeInstances) {
      queryBuilder
        .leftJoinAndSelect('task.instances', 'instances')
        .orderBy('instances.scheduledDate', 'ASC');
    }

    const task = await queryBuilder.getOne();

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  /**
   * 更新任务
   */
  async updateTask(userId: string, taskId: string, updateTaskDto: UpdateTaskDto) {
    const { tags, cronExpression, ...updateData } = updateTaskDto;
    
    const task = await this.findTaskById(userId, taskId, false);

    // 验证 cron 表达式
    if (cronExpression !== undefined) {
      if (cronExpression && !cron.validate(cronExpression)) {
        throw new BadRequestException('Invalid cron expression');
      }
      updateData['cronExpression'] = cronExpression;
      updateData['isRecurring'] = !!cronExpression;
    }

    // 更新任务基本信息
    await this.taskRepository.update(taskId, updateData);

    // 更新标记
    if (tags !== undefined) {
      // 删除旧标记
      await this.taskTagRepository.delete({ taskId });
      
      // 创建新标记
      if (tags.length > 0) {
        const taskTags = tags.map(tag => 
          this.taskTagRepository.create({
            key: tag.key,
            value: tag.value,
            taskId
          })
        );
        await this.taskTagRepository.save(taskTags);
      }
    }

    return this.findTaskById(userId, taskId, false);
  }

  /**
   * 删除任务
   */
  async deleteTask(userId: string, taskId: string) {
    const task = await this.findTaskById(userId, taskId, false);
    
    await this.taskRepository.softDelete(taskId);
    
    return {
      success: true,
      message: 'Task deleted successfully'
    };
  }

  /**
   * 完成任务
   */
  async completeTask(userId: string, taskId: string) {
    const task = await this.findTaskById(userId, taskId, false);
    
    if (task.status === TaskStatus.COMPLETED) {
      throw new BadRequestException('Task is already completed');
    }

    await this.taskRepository.update(taskId, { 
      status: TaskStatus.COMPLETED 
    });

    const updatedTask = await this.findTaskById(userId, taskId, false);
    
    return {
      success: true,
      task: updatedTask
    };
  }

  /**
   * 取消任务
   */
  async cancelTask(userId: string, taskId: string) {
    const task = await this.findTaskById(userId, taskId, false);
    
    if (task.status === TaskStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed task');
    }

    await this.taskRepository.update(taskId, { 
      status: TaskStatus.CANCELLED 
    });

    return this.findTaskById(userId, taskId, false);
  }

  /**
   * 重新激活任务
   */
  async reactivateTask(userId: string, taskId: string) {
    const task = await this.findTaskById(userId, taskId, false);
    
    if (task.status !== TaskStatus.CANCELLED) {
      throw new BadRequestException('Only cancelled tasks can be reactivated');
    }

    await this.taskRepository.update(taskId, { 
      status: TaskStatus.PENDING 
    });

    return this.findTaskById(userId, taskId, false);
  }

  /**
   * 获取任务统计信息
   */
  async getTaskStatistics(userId: string) {
    const tasks = await this.taskRepository.find({
      where: { userId, deletedAt: null },
      select: ['status', 'type']
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const overdueTasks = tasks.filter(t => t.status === TaskStatus.OVERDUE).length;
    const pendingTasks = tasks.filter(t => t.status === TaskStatus.PENDING).length;
    const inProgressTasks = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;

    const tasksByType = {
      [TaskType.MAIN]: tasks.filter(t => t.type === TaskType.MAIN).length,
      [TaskType.SUB]: tasks.filter(t => t.type === TaskType.SUB).length,
      [TaskType.DAILY]: tasks.filter(t => t.type === TaskType.DAILY).length,
      [TaskType.EVENT]: tasks.filter(t => t.type === TaskType.EVENT).length,
    };

    return {
      totalTasks,
      completedTasks,
      overdueTasks,
      pendingTasks,
      inProgressTasks,
      tasksByType
    };
  }

  /**
   * 生成循环任务实例
   */
  async generateTaskInstances(userId: string, taskId: string, generateDto: GenerateInstancesDto) {
    const { count = 10, startDate, endDate } = generateDto;
    
    const task = await this.findTaskById(userId, taskId, false);

    if (!task.isRecurring || !task.cronExpression) {
      throw new BadRequestException('Task is not a recurring task');
    }

    const instances = [];
    let nextDate = startDate ? new Date(startDate) : new Date();
    const endDateTime = endDate ? new Date(endDate) : null;

    for (let i = 0; i < count; i++) {
      // 计算下一个执行时间（简化实现）
      nextDate = this.getNextScheduleDate(task.cronExpression, nextDate);
      
      if (endDateTime && nextDate > endDateTime) {
        break;
      }
      
      const instance = this.taskInstanceRepository.create({
        taskId: task.id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate ? new Date(nextDate.getTime() + (task.dueDate.getTime() - task.createdAt.getTime())) : null,
        status: TaskStatus.PENDING,
        scheduledDate: nextDate
      });

      instances.push(instance);
    }

    return this.taskInstanceRepository.save(instances);
  }

  /**
   * 获取任务实例列表
   */
  async getTaskInstances(userId: string, taskId: string) {
    const task = await this.findTaskById(userId, taskId, false);
    
    return this.taskInstanceRepository.find({
      where: { taskId },
      order: { scheduledDate: 'ASC' }
    });
  }

  /**
   * 完成任务实例
   */
  async completeTaskInstance(userId: string, taskId: string, instanceId: string) {
    const task = await this.findTaskById(userId, taskId, false);
    
    const instance = await this.taskInstanceRepository.findOne({
      where: { id: instanceId, taskId }
    });

    if (!instance) {
      throw new NotFoundException('Task instance not found');
    }

    await this.taskInstanceRepository.update(instanceId, {
      status: TaskStatus.COMPLETED,
      completedAt: new Date()
    });

    return this.taskInstanceRepository.findOne({
      where: { id: instanceId }
    });
  }

  /**
   * 批量更新任务
   */
  async batchUpdateTasks(userId: string, batchUpdateDto: BatchUpdateTasksDto) {
    const { taskIds, action, status } = batchUpdateDto;
    
    // 验证任务所有权
    const tasks = await this.taskRepository.find({
      where: { id: In(taskIds), userId, deletedAt: null }
    });

    if (tasks.length !== taskIds.length) {
      throw new BadRequestException('Some tasks not found or not accessible');
    }

    let updatedCount = 0;
    const errors = [];

    try {
      switch (action) {
        case 'complete':
          await this.taskRepository.update(
            { id: In(taskIds) },
            { status: TaskStatus.COMPLETED }
          );
          updatedCount = taskIds.length;
          break;
          
        case 'delete':
          await this.taskRepository.softDelete({ id: In(taskIds) });
          updatedCount = taskIds.length;
          break;
          
        case 'updateStatus':
          if (!status) {
            throw new BadRequestException('Status is required for updateStatus action');
          }
          await this.taskRepository.update(
            { id: In(taskIds) },
            { status }
          );
          updatedCount = taskIds.length;
          break;
      }
    } catch (error) {
      errors.push(error.message);
    }

    return {
      success: errors.length === 0,
      updatedCount,
      failedCount: taskIds.length - updatedCount,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * 获取超时任务
   */
  async getOverdueTasks(userId: string) {
    const now = new Date();
    
    return this.taskRepository.find({
      where: {
        userId,
        dueDate: Between(new Date('1900-01-01'), now),
        status: In([TaskStatus.PENDING, TaskStatus.IN_PROGRESS]),
        deletedAt: null
      },
      relations: ['tags'],
      order: { dueDate: 'ASC' }
    });
  }

  /**
   * 获取今日任务
   */
  async getTodayTasks(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.taskRepository.find({
      where: {
        userId,
        dueDate: Between(today, tomorrow),
        deletedAt: null
      },
      relations: ['tags'],
      order: { dueDate: 'ASC' }
    });
  }

  /**
   * 获取本周任务
   */
  async getWeekTasks(userId: string) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return this.taskRepository.find({
      where: {
        userId,
        dueDate: Between(startOfWeek, endOfWeek),
        deletedAt: null
      },
      relations: ['tags'],
      order: { dueDate: 'ASC' }
    });
  }

  /**
   * 搜索任务
   */
  async searchTasks(userId: string, keyword: string) {
    return this.taskRepository.find({
      where: [
        { userId, title: Like(`%${keyword}%`), deletedAt: null },
        { userId, description: Like(`%${keyword}%`), deletedAt: null }
      ],
      relations: ['tags'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * 根据类型获取任务
   */
  async getTasksByType(userId: string, type: TaskType) {
    return this.taskRepository.find({
      where: { userId, type, deletedAt: null },
      relations: ['tags'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * 根据状态获取任务
   */
  async getTasksByStatus(userId: string, status: TaskStatus) {
    return this.taskRepository.find({
      where: { userId, status, deletedAt: null },
      relations: ['tags'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * 计算下一个调度日期（简化实现）
   */
  private getNextScheduleDate(cronExpression: string, fromDate: Date): Date {
    // 这里是简化实现，实际应该使用专业的 cron 库
    // 暂时返回下一天作为示例
    const nextDate = new Date(fromDate);
    nextDate.setDate(nextDate.getDate() + 1);
    return nextDate;
  }
}