import { Entity, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { Task } from './task.entity';

@Entity('task_tag')
export class TaskTag extends BaseEntity {
  @Column({ type: 'varchar', length: 21, comment: '任务ID' })
  taskId: string;

  @Column({ length: 100, comment: '标记键' })
  key: string;

  @Column({ type: 'text', comment: '标记值' })
  value: string;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  // 关联任务
  @ManyToOne(() => Task, task => task.tags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  task: Task;
}