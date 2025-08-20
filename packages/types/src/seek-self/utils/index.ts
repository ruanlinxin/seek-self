/**
 * SeekSelf.Utils 命名空间
 * 包含所有工具类相关的类型定义
 */

/// <reference path="./peer/index.ts" />

declare namespace SeekSelf.Utils {
  /**
   * 通用工具类型
   */
  
  /**
   * 深度部分类型
   */
  type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
  };

  /**
   * 深度必需类型
   */
  type DeepRequired<T> = {
    [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
  };

  /**
   * 值的类型
   */
  type ValueOf<T> = T[keyof T];

  /**
   * 提取函数参数类型
   */
  type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never;

  /**
   * 提取函数返回类型
   */
  type ReturnType<F extends Function> = F extends (...args: any[]) => infer R ? R : never;

  /**
   * 可空类型
   */
  type Nullable<T> = T | null;

  /**
   * 可选类型
   */
  type Optional<T> = T | undefined;

  /**
   * 请求配置
   */
  interface RequestConfig {
    /** 请求 URL */
    url: string;
    /** 请求方法 */
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    /** 请求头 */
    headers?: Record<string, string>;
    /** 请求体 */
    body?: any;
    /** 超时时间 (毫秒) */
    timeout?: number;
    /** 是否需要认证 */
    requiresAuth?: boolean;
    /** 重试次数 */
    retries?: number;
    /** 重试间隔 (毫秒) */
    retryDelay?: number;
  }

  /**
   * API 响应类型
   */
  interface ApiResponse<T = any> {
    /** 是否成功 */
    success: boolean;
    /** 响应数据 */
    data?: T;
    /** 错误信息 */
    error?: string;
    /** 响应消息 */
    message?: string;
    /** 状态码 */
    code?: number;
    /** 时间戳 */
    timestamp?: Date;
  }

  /**
   * 分页参数
   */
  interface PaginationParams {
    /** 页码 */
    page: number;
    /** 每页数量 */
    limit: number;
    /** 排序字段 */
    sortBy?: string;
    /** 排序方向 */
    sortOrder?: 'asc' | 'desc';
  }

  /**
   * 分页响应
   */
  interface PaginatedResponse<T> extends ApiResponse<T[]> {
    /** 分页信息 */
    pagination: {
      /** 当前页码 */
      page: number;
      /** 每页数量 */
      limit: number;
      /** 总记录数 */
      total: number;
      /** 总页数 */
      totalPages: number;
      /** 是否有下一页 */
      hasNext: boolean;
      /** 是否有上一页 */
      hasPrev: boolean;
    };
  }

  /**
   * 缓存配置
   */
  interface CacheConfig {
    /** 缓存键 */
    key: string;
    /** 过期时间 (毫秒) */
    ttl?: number;
    /** 是否持久化 */
    persistent?: boolean;
    /** 缓存策略 */
    strategy?: 'memory' | 'localStorage' | 'sessionStorage';
  }

  /**
   * 存储接口
   */
  interface Storage {
    /** 获取值 */
    get<T = any>(key: string): Promise<T | null>;
    /** 设置值 */
    set<T = any>(key: string, value: T, ttl?: number): Promise<void>;
    /** 删除值 */
    remove(key: string): Promise<void>;
    /** 清空存储 */
    clear(): Promise<void>;
    /** 检查键是否存在 */
    has(key: string): Promise<boolean>;
    /** 获取所有键 */
    keys(): Promise<string[]>;
  }

  /**
   * 事件发射器接口
   */
  interface EventEmitter<T = any> {
    /** 添加监听器 */
    on(event: string, listener: (data: T) => void): void;
    /** 移除监听器 */
    off(event: string, listener: (data: T) => void): void;
    /** 触发事件 */
    emit(event: string, data: T): void;
    /** 一次性监听器 */
    once(event: string, listener: (data: T) => void): void;
    /** 移除所有监听器 */
    removeAllListeners(event?: string): void;
  }

  /**
   * 日志级别
   */
  type LogLevel = 'debug' | 'info' | 'warn' | 'error';

  /**
   * 日志接口
   */
  interface Logger {
    /** 调试日志 */
    debug(message: string, ...args: any[]): void;
    /** 信息日志 */
    info(message: string, ...args: any[]): void;
    /** 警告日志 */
    warn(message: string, ...args: any[]): void;
    /** 错误日志 */
    error(message: string, ...args: any[]): void;
    /** 设置日志级别 */
    setLevel(level: LogLevel): void;
  }

  /**
   * 配置管理接口
   */
  interface Config<T = any> {
    /** 获取配置 */
    get<K extends keyof T>(key: K): T[K];
    /** 设置配置 */
    set<K extends keyof T>(key: K, value: T[K]): void;
    /** 获取所有配置 */
    getAll(): T;
    /** 更新配置 */
    update(config: Partial<T>): void;
    /** 重置配置 */
    reset(): void;
  }

  /**
   * 验证规则
   */
  interface ValidationRule<T = any> {
    /** 验证函数 */
    validator: (value: T) => boolean | Promise<boolean>;
    /** 错误消息 */
    message: string;
    /** 是否必需 */
    required?: boolean;
  }

  /**
   * 验证结果
   */
  interface ValidationResult {
    /** 是否有效 */
    valid: boolean;
    /** 错误信息 */
    errors: string[];
  }

  /**
   * 表单验证器
   */
  interface Validator<T = any> {
    /** 添加验证规则 */
    addRule<K extends keyof T>(field: K, rule: ValidationRule<T[K]>): void;
    /** 验证字段 */
    validateField<K extends keyof T>(field: K, value: T[K]): Promise<ValidationResult>;
    /** 验证整个对象 */
    validate(data: T): Promise<ValidationResult>;
  }

  // 重新导出 Peer 命名空间
  export import Peer = SeekSelf.Utils.Peer;
}

// 导出命名空间
export = SeekSelf.Utils;
export as namespace SeekSelfUtils;
