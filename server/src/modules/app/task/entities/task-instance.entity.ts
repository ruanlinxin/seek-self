import { Entity, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { Task } from './task.entity';

@Entity('task_instance')
export class TaskInstance extends BaseEntity {
  @Column({ type: 'varchar', length: 21, comment: '原任务ID' })
  taskId: string;

  @Column({ length: 200, comment: '实例标题' })
  title: string;

  @Column({ type: 'text', nullable: true, comment: '实例描述' })
  description: string;

  @Column({ type: 'datetime', nullable: true, comment: '截止时间' })
  dueDate: Date;

  @Column({ length: 20, default: 'pending', comment: '实例状态：pending-待处理，in_progress-进行中，completed-已完成，overdue-已超时，cancelled-已取消' })
  status: string;

  @Column({ type: 'datetime', comment: '计划执行日期' })
  scheduledDate: Date;

  @Column({ type: 'datetime', nullable: true, comment: '完成时间' })
  completedAt: Date;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  // 关联原任务
  @ManyToOne(() => Task, task => task.instances, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  task: Task;
}