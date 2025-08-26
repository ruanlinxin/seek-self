import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { TaskTag } from './entities/task-tag.entity';
import { TaskInstance } from './entities/task-instance.entity';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, TaskTag, TaskInstance]),
    AuthModule,
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}