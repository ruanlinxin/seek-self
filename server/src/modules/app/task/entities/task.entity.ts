import { Entity, Column, OneToMany, DeleteDateColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { TaskTag } from './task-tag.entity';
import { TaskInstance } from './task-instance.entity';

@Entity('task')
export class Task extends BaseEntity {
  @Column({ length: 200, comment: '任务标题' })
  title: string;

  @Column({ type: 'text', nullable: true, comment: '任务描述' })
  description: string;

  @Column({ length: 20, comment: '任务类型：main-主线，sub-支线，daily-日常，event-活动' })
  type: string;

  @Column({ length: 20, default: 'pending', comment: '任务状态：pending-待处理，in_progress-进行中，completed-已完成，overdue-已超时，cancelled-已取消' })
  status: string;

  @Column({ type: 'datetime', nullable: true, comment: '截止时间' })
  dueDate: Date;

  @Column({ length: 100, nullable: true, comment: 'Cron表达式（循环任务）' })
  cronExpression: string;

  @Column({ type: 'boolean', default: false, comment: '是否为循环任务' })
  isRecurring: boolean;

  @Column({ type: 'varchar', length: 21, comment: '用户ID' })
  userId: string;

  @DeleteDateColumn({ comment: '删除时间' })
  deletedAt: Date;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  // 关联任务标记
  @OneToMany(() => TaskTag, taskTag => taskTag.task, { cascade: true })
  tags: TaskTag[];

  // 关联任务实例（循环任务生成的实例）
  @OneToMany(() => TaskInstance, taskInstance => taskInstance.task)
  instances: TaskInstance[];
}