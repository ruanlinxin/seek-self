import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('user')
export class User extends BaseEntity {
  @Column({ unique: true, length: 50, comment: '用户名' })
  username: string;

  @Column({ length: 100, comment: '密码' })
  password: string;
} 