import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_profile')
export class UserProfile {
  @PrimaryColumn({ type: 'varchar', length: 21 })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ length: 50, comment: '昵称' })
  nickname: string;

  @Column({ length: 255, nullable: true, comment: '头像' })
  avatar: string;

  @Column({ type: 'tinyint', default: 0, comment: '性别 0-未知 1-男 2-女' })
  gender: number;

  @Column({ length: 255, nullable: true, comment: '简介' })
  bio: string;

  @Column({ type: 'date', nullable: true, comment: '生日' })
  birth: Date;
} 