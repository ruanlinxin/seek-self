import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('user_app_relation')
export class UserAppRelation extends BaseEntity {
  @Column({ length: 21, comment: '用户ID' })
  userId: string;

  @Column({ length: 21, comment: '应用ID' })
  appId: string;

  @Column({ type: 'datetime', nullable: true, comment: '最近使用时间' })
  usedAt: Date | null;

  @Column({ type: 'datetime', nullable: true, comment: '收藏时间' })
  favoriteAt: Date | null;
} 