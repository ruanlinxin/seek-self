import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { User } from '@/modules/user/user.entity';

@Entity('device')
@Index(['userId', 'deviceId'])
export class Device extends BaseEntity {
  @Column({ type: 'varchar', length: 21, nullable: true, comment: '用户ID（匿名设备时为空）' })
  userId: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User | null;

  @Column({ type: 'varchar', length: 100, comment: '设备唯一标识' })
  deviceId: string;

  @Column({ type: 'varchar', length: 50, comment: '设备类型: browser, mobile, desktop' })
  deviceType: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '平台: web, ios, android, windows, macos, linux' })
  platform: string;

  // === 基础设备信息 ===
  @Column({ type: 'varchar', length: 100, nullable: true, comment: '设备名称/型号' })
  deviceName: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '设备品牌' })
  deviceBrand: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '操作系统' })
  osName: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '操作系统版本' })
  osVersion: string;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '系统架构' })
  architecture: string;

  // === 浏览器相关信息 ===
  @Column({ type: 'varchar', length: 100, nullable: true, comment: '浏览器名称' })
  browserName: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '浏览器版本' })
  browserVersion: string;

  @Column({ type: 'text', nullable: true, comment: '完整 User-Agent' })
  userAgent: string;

  // === 屏幕和显示信息 ===
  @Column({ type: 'int', nullable: true, comment: '屏幕宽度' })
  screenWidth: number;

  @Column({ type: 'int', nullable: true, comment: '屏幕高度' })
  screenHeight: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true, comment: '设备像素比' })
  devicePixelRatio: number;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '屏幕方向' })
  screenOrientation: string;

  @Column({ type: 'boolean', nullable: true, comment: '是否支持触摸' })
  touchSupport: boolean;

  // === 系统资源信息 ===
  @Column({ type: 'int', nullable: true, comment: 'CPU 核心数' })
  cpuCores: number;

  @Column({ type: 'bigint', nullable: true, comment: '总内存(MB)' })
  totalMemory: number;

  // === 网络信息 ===
  @Column({ type: 'varchar', length: 50, nullable: true, comment: '网络类型' })
  networkType: string;

  // === 应用信息 ===
  @Column({ type: 'varchar', length: 50, nullable: true, comment: '应用版本' })
  appVersion: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '应用构建版本' })
  appBuildVersion: string;



  // === 其他信息 ===
  @Column({ type: 'varchar', length: 10, nullable: true, comment: '语言设置' })
  language: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '时区' })
  timezone: string;

  @Column({ type: 'json', nullable: true, comment: '扩展信息' })
  extendInfo: any;

  @Column({ type: 'timestamp', nullable: true, comment: '最后活跃时间' })
  lastActiveAt: Date;

  @Column({ type: 'boolean', default: true, comment: '是否在线' })
  isOnline: boolean;
}