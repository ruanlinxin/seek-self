import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TokenUserId } from '../../../common/decorators/token.decorator';
import { TaskService } from './task.service';
import { 
  CreateTaskDto, 
  UpdateTaskDto, 
  TaskQueryDto,
  TaskType,
  TaskStatus,
  BatchUpdateTasksDto,
  GenerateInstancesDto
} from './dto/task.dto';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  // 基础CRUD操作

  /**
   * 获取任务列表
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async getTasks(
    @TokenUserId() userId: string,
    @Query() queryDto: TaskQueryDto
  ) {
    return this.taskService.findUserTasks(userId, queryDto);
  }

  /**
   * 创建新任务
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async createTask(
    @TokenUserId() userId: string,
    @Body() createTaskDto: CreateTaskDto
  ) {
    return this.taskService.createTask(userId, createTaskDto);
  }

  /**
   * 获取任务详情
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getTaskById(
    @TokenUserId() userId: string,
    @Param('id') id: string,
    @Query('includeInstances') includeInstances?: boolean
  ) {
    return this.taskService.findTaskById(userId, id, includeInstances);
  }

  /**
   * 更新任务
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateTask(
    @TokenUserId() userId: string,
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto
  ) {
    return this.taskService.updateTask(userId, id, updateTaskDto);
  }

  /**
   * 删除任务
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteTask(
    @TokenUserId() userId: string,
    @Param('id') id: string
  ) {
    return this.taskService.deleteTask(userId, id);
  }

  // 任务状态操作

  /**
   * 完成任务
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  async completeTask(
    @TokenUserId() userId: string,
    @Param('id') id: string
  ) {
    return this.taskService.completeTask(userId, id);
  }

  /**
   * 取消任务
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelTask(
    @TokenUserId() userId: string,
    @Param('id') id: string
  ) {
    return this.taskService.cancelTask(userId, id);
  }

  /**
   * 重新激活任务
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/reactivate')
  @HttpCode(HttpStatus.OK)
  async reactivateTask(
    @TokenUserId() userId: string,
    @Param('id') id: string
  ) {
    return this.taskService.reactivateTask(userId, id);
  }

  // 任务统计和查询

  /**
   * 获取任务统计信息
   */
  @UseGuards(JwtAuthGuard)
  @Get('statistics')
  async getTaskStatistics(
    @TokenUserId() userId: string
  ) {
    return this.taskService.getTaskStatistics(userId);
  }

  /**
   * 获取超时任务列表
   */
  @UseGuards(JwtAuthGuard)
  @Get('overdue')
  async getOverdueTasks(
    @TokenUserId() userId: string
  ) {
    return this.taskService.getOverdueTasks(userId);
  }

  /**
   * 获取今日任务
   */
  @UseGuards(JwtAuthGuard)
  @Get('today')
  async getTodayTasks(
    @TokenUserId() userId: string
  ) {
    return this.taskService.getTodayTasks(userId);
  }

  /**
   * 获取本周任务
   */
  @UseGuards(JwtAuthGuard)
  @Get('week')
  async getWeekTasks(
    @TokenUserId() userId: string
  ) {
    return this.taskService.getWeekTasks(userId);
  }

  /**
   * 搜索任务
   */
  @UseGuards(JwtAuthGuard)
  @Get('search')
  async searchTasks(
    @TokenUserId() userId: string,
    @Query('keyword') keyword: string
  ) {
    return this.taskService.searchTasks(userId, keyword);
  }

  /**
   * 根据类型获取任务
   */
  @UseGuards(JwtAuthGuard)
  @Get('type/:type')
  async getTasksByType(
    @TokenUserId() userId: string,
    @Param('type') type: TaskType
  ) {
    return this.taskService.getTasksByType(userId, type);
  }

  /**
   * 根据状态获取任务
   */
  @UseGuards(JwtAuthGuard)
  @Get('status/:status')
  async getTasksByStatus(
    @TokenUserId() userId: string,
    @Param('status') status: TaskStatus
  ) {
    return this.taskService.getTasksByStatus(userId, status);
  }

  // 循环任务实例管理

  /**
   * 生成循环任务实例
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/instances')
  async generateTaskInstances(
    @TokenUserId() userId: string,
    @Param('id') id: string,
    @Body() generateDto: GenerateInstancesDto
  ) {
    return this.taskService.generateTaskInstances(userId, id, generateDto);
  }

  /**
   * 获取任务实例列表
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id/instances')
  async getTaskInstances(
    @TokenUserId() userId: string,
    @Param('id') id: string
  ) {
    return this.taskService.getTaskInstances(userId, id);
  }

  /**
   * 完成任务实例
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/instances/:instanceId/complete')
  @HttpCode(HttpStatus.OK)
  async completeTaskInstance(
    @TokenUserId() userId: string,
    @Param('id') taskId: string,
    @Param('instanceId') instanceId: string
  ) {
    return this.taskService.completeTaskInstance(userId, taskId, instanceId);
  }

  // 批量操作

  /**
   * 批量更新任务
   */
  @UseGuards(JwtAuthGuard)
  @Put('batch')
  async batchUpdateTasks(
    @TokenUserId() userId: string,
    @Body() batchUpdateDto: BatchUpdateTasksDto
  ) {
    return this.taskService.batchUpdateTasks(userId, batchUpdateDto);
  }
}