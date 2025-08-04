import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('dict')
export class Dict extends BaseEntity {
  @Column({ length: 50, comment: '字典类型' })
  type: string;

  @Column({ length: 100, unique: true, comment: '字典键' })
  key: string;

  @Column({ length: 255, comment: '字典值' })
  value: string;

  @Column({ length: 255, nullable: true, comment: '描述' })
  description: string;

  @Column({ type: 'boolean', default: false, comment: '是否启用' })
  enabled: boolean;

  @Column({ type: 'int', default: 0, comment: '排序' })
  orderNo: number;
} 