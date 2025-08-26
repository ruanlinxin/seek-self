import { IsString, IsOptional, IsEnum, IsDateString, IsBoolean, IsArray, ValidateNested, IsNumber, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';

// 任务类型枚举
export enum TaskType {
  MAIN = 'main',
  SUB = 'sub',
  DAILY = 'daily',
  EVENT = 'event'
}

// 任务状态枚举
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

// 任务标记DTO
export class TaskTagDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  key: string;

  @IsString()
  value: string;
}

// 创建任务DTO
export class CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(TaskType)
  type: TaskType;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  cronExpression?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskTagDto)
  tags?: TaskTagDto[];
}

// 更新任务DTO
export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskType)
  type?: TaskType;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  cronExpression?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskTagDto)
  tags?: TaskTagDto[];
}

// 任务查询参数DTO
export class TaskQueryDto {
  @IsOptional()
  @IsEnum(TaskType)
  type?: TaskType;

  @IsOptional()
  @IsString()
  status?: string; // 支持单个状态或逗号分隔的多个状态，如 'pending' 或 'pending,in_progress'

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsDateString()
  dueAfter?: string;

  @IsOptional()
  @IsDateString()
  dueBefore?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  includeInstances?: boolean = false;
}

// 批量更新任务DTO
export class BatchUpdateTasksDto {
  @IsArray()
  @IsString({ each: true })
  taskIds: string[];

  @IsEnum(['complete', 'delete', 'updateStatus'])
  action: 'complete' | 'delete' | 'updateStatus';

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}

// 生成任务实例DTO
export class GenerateInstancesDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  count?: number = 10;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

// 任务实例状态更新DTO
export class UpdateTaskInstanceDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsDateString()
  completedAt?: string;
}