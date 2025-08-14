import { Entity, Column, DeleteDateColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('app')
export class App extends BaseEntity {
  @Column({ length: 50, comment: '分组' })
  group: string;

  @Column({ length: 100, comment: '应用名' })
  name: string;

  @Column({ length: 255, nullable: true, comment: '介绍' })
  description: string;

  @Column({ length: 255, nullable: true, comment: '图标' })
  icon: string;

  @Column({ type: 'int', default: 1, comment: '状态 1-启用 0-禁用' })
  status: number;

  @Column({ type: 'int', default: 0, comment: '排序' })
  orderNo: number;

  @Column({ length: 20, nullable: true, comment: '版本号' })
  version: string;

  @Column({ length: 255, nullable: true, comment: '入口地址' })
  entryUrl: string;

  @Column({ type: 'boolean', default: false, comment: '是否系统应用' })
  isSystem: boolean;

  @Column({ type: 'json', nullable: true, comment: '扩展信息' })
  appExtend: any;

  @Column({ length: 100, nullable: true, comment: '组件key' })
  componentKey: string;

  @Column({ length: 50, nullable: true, comment: '应用类型' })
  appType: string;

  @DeleteDateColumn({ comment: '删除时间' })
  deletedAt: Date;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  @Column({ type: 'varchar', length: 21, nullable: true, comment: '创建人ID' })
  createdBy: string;

  @Column({ type: 'varchar', length: 21, nullable: true, comment: '更新人ID' })
  updatedBy: string;
} 