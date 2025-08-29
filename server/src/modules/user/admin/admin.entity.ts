import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('admin')
export class Admin extends BaseEntity {
  @Column({ unique: true, length: 50, comment: '管理员用户ID' })
  userId: string;

  @Column({ default: true, comment: '是否激活' })
  isActive: boolean;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark?: string;
}