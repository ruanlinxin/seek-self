/**
 * SeekSelf 顶层命名空间
 * 包含整个应用的类型定义体系
 */

/// <reference path="./utils/index.ts" />

declare namespace SeekSelf {
  /**
   * 应用核心类型
   */

  /**
   * 用户接口
   */
  interface User {
    /** 用户 ID */
    id: string;
    /** 用户名 */
    username: string;
    /** 邮箱 */
    email: string;
    /** 昵称 */
    nickname?: string;
    /** 头像 URL */
    avatar?: string;
    /** 个人简介 */
    bio?: string;
    /** 创建时间 */
    createdAt: Date;
    /** 更新时间 */
    updatedAt: Date;
    /** 最后登录时间 */
    lastLoginAt?: Date;
    /** 用户状态 */
    status: 'active' | 'inactive' | 'suspended';
    /** 用户角色 */
    role: 'user' | 'admin' | 'moderator';
    /** 用户偏好设置 */
    preferences?: UserPreferences;
  }

  /**
   * 用户偏好设置
   */
  interface UserPreferences {
    /** 主题设置 */
    theme: 'light' | 'dark' | 'auto';
    /** 语言设置 */
    language: string;
    /** 通知设置 */
    notifications: {
      /** 邮件通知 */
      email: boolean;
      /** 推送通知 */
      push: boolean;
      /** 任务提醒 */
      taskReminders: boolean;
      /** 系统消息 */
      systemMessages: boolean;
    };
    /** 隐私设置 */
    privacy: {
      /** 个人资料可见性 */
      profileVisibility: 'public' | 'private' | 'friends';
      /** 任务可见性 */
      taskVisibility: 'public' | 'private';
    };
  }

  /**
   * 任务难度等级
   */
  type TaskDifficulty = 'easy' | 'medium' | 'hard' | 'epic';

  /**
   * 任务状态
   */
  type TaskStatus = 'available' | 'in_progress' | 'completed' | 'failed' | 'paused';

  /**
   * 任务类型
   */
  type TaskType = 'daily' | 'weekly' | 'monthly' | 'main' | 'side' | 'custom';

  /**
   * 任务奖励
   */
  interface TaskReward {
    /** 经验值 */
    exp: number;
    /** 金币 */
    gold: number;
    /** 特殊奖励 */
    items?: TaskItem[];
  }

  /**
   * 任务道具
   */
  interface TaskItem {
    /** 道具 ID */
    id: string;
    /** 道具名称 */
    name: string;
    /** 道具描述 */
    description: string;
    /** 道具类型 */
    type: 'badge' | 'tool' | 'resource';
    /** 道具图标 */
    icon?: string;
    /** 稀有度 */
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  }

  /**
   * 任务接口
   */
  interface Task {
    /** 任务 ID */
    id: string;
    /** 任务标题 */
    title: string;
    /** 任务描述 */
    description: string;
    /** 任务难度 */
    difficulty: TaskDifficulty;
    /** 任务类型 */
    type: TaskType;
    /** 任务状态 */
    status: TaskStatus;
    /** 任务奖励 */
    reward: TaskReward;
    /** 创建者 ID */
    creatorId: string;
    /** 分配给的用户 ID */
    assigneeId?: string;
    /** 创建时间 */
    createdAt: Date;
    /** 更新时间 */
    updatedAt: Date;
    /** 开始时间 */
    startedAt?: Date;
    /** 完成时间 */
    completedAt?: Date;
    /** 截止时间 */
    dueDate?: Date;
    /** 任务标签 */
    tags: string[];
    /** 任务依赖 */
    dependencies?: string[];
    /** 子任务 */
    subtasks?: SubTask[];
    /** 进度百分比 */
    progress: number;
    /** 任务元数据 */
    metadata?: Record<string, any>;
  }

  /**
   * 子任务接口
   */
  interface SubTask {
    /** 子任务 ID */
    id: string;
    /** 子任务标题 */
    title: string;
    /** 子任务描述 */
    description?: string;
    /** 是否完成 */
    completed: boolean;
    /** 完成时间 */
    completedAt?: Date;
    /** 顺序 */
    order: number;
  }

  /**
   * 用户等级系统
   */
  interface UserLevel {
    /** 当前等级 */
    level: number;
    /** 当前经验值 */
    currentExp: number;
    /** 升级所需经验值 */
    requiredExp: number;
    /** 总经验值 */
    totalExp: number;
    /** 等级标题 */
    title: string;
    /** 等级徽章 */
    badge?: string;
  }

  /**
   * 用户统计
   */
  interface UserStats {
    /** 等级信息 */
    level: UserLevel;
    /** 金币数量 */
    gold: number;
    /** 完成任务数 */
    completedTasks: number;
    /** 连续签到天数 */
    streakDays: number;
    /** 总活跃天数 */
    activeDays: number;
    /** 获得的徽章 */
    badges: TaskItem[];
    /** 成就列表 */
    achievements: Achievement[];
  }

  /**
   * 成就接口
   */
  interface Achievement {
    /** 成就 ID */
    id: string;
    /** 成就名称 */
    name: string;
    /** 成就描述 */
    description: string;
    /** 成就图标 */
    icon: string;
    /** 获得时间 */
    unlockedAt: Date;
    /** 成就类型 */
    type: 'task' | 'streak' | 'level' | 'social' | 'special';
    /** 成就等级 */
    tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  }

  /**
   * 应用配置
   */
  interface AppConfig {
    /** 应用名称 */
    appName: string;
    /** 应用版本 */
    version: string;
    /** API 基础地址 */
    apiBaseUrl: string;
    /** 是否为开发模式 */
    isDevelopment: boolean;
    /** 功能开关 */
    features: {
      /** 是否启用 P2P 功能 */
      enablePeer: boolean;
      /** 是否启用任务系统 */
      enableTasks: boolean;
      /** 是否启用社交功能 */
      enableSocial: boolean;
      /** 是否启用文件共享 */
      enableFileSharing: boolean;
    };
    /** 限制配置 */
    limits: {
      /** 最大文件大小 (MB) */
      maxFileSize: number;
      /** 最大消息长度 */
      maxMessageLength: number;
      /** 最大连接数 */
      maxConnections: number;
    };
  }

  /**
   * 错误接口
   */
  interface AppError {
    /** 错误代码 */
    code: string;
    /** 错误消息 */
    message: string;
    /** 错误详情 */
    details?: any;
    /** 错误时间 */
    timestamp: Date;
    /** 错误来源 */
    source: 'client' | 'server' | 'network' | 'peer';
    /** 错误级别 */
    level: 'info' | 'warning' | 'error' | 'critical';
  }

  /**
   * 通知接口
   */
  interface Notification {
    /** 通知 ID */
    id: string;
    /** 通知标题 */
    title: string;
    /** 通知内容 */
    content: string;
    /** 通知类型 */
    type: 'info' | 'success' | 'warning' | 'error';
    /** 是否已读 */
    isRead: boolean;
    /** 创建时间 */
    createdAt: Date;
    /** 过期时间 */
    expiresAt?: Date;
    /** 相关数据 */
    data?: any;
    /** 操作按钮 */
    actions?: NotificationAction[];
  }

  /**
   * 通知操作
   */
  interface NotificationAction {
    /** 操作 ID */
    id: string;
    /** 操作标签 */
    label: string;
    /** 操作类型 */
    type: 'primary' | 'secondary' | 'danger';
    /** 操作处理器 */
    handler: string;
  }

  // 重新导出 Utils 命名空间
  export import Utils = SeekSelf.Utils;

  /**
   * 全局类型别名
   */
  
  /** API 响应类型别名 */
  type ApiResponse<T = any> = Utils.ApiResponse<T>;
  
  
  
  /** Peer 相关类型别名 */
  namespace Peer {
    export type Config = Utils.Peer.Config;
    export type Message<T = any> = Utils.Peer.Message<T>;
    export type Connection = Utils.Peer.Connection;
    export type State = Utils.Peer.State;
    export type HookReturn = Utils.Peer.HookReturn;
    export type HookOptions = Utils.Peer.HookOptions;
  }
}

// 导出命名空间
export = SeekSelf;
export as namespace SeekSelf;
