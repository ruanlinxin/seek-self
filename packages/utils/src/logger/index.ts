import { SeekSelf } from '@seek-self/types';

type LogLevel = SeekSelf.Utils.LogLevel;

// 声明全局变量（React Native环境）
declare global {
  var __DEV__: boolean | undefined;
}

/**
 * 日志级别优先级映射
 */
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * 日志级别颜色映射（仅在浏览器环境下使用）
 */
const LOG_COLORS: Record<LogLevel, string> = {
  debug: '#6B7280', // 灰色
  info: '#3B82F6',  // 蓝色
  warn: '#F59E0B',  // 黄色
  error: '#EF4444', // 红色
};

/**
 * 默认日志器实现
 */
class DefaultLogger implements SeekSelf.Utils.Logger {
  private currentLevel: LogLevel = 'info';
  private prefix: string;

  constructor(prefix?: string) {
    this.prefix = prefix || 'APP';
  }

  /**
   * 设置日志级别
   */
  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  /**
   * 获取当前日志级别
   */
  getLevel(): LogLevel {
    return this.currentLevel;
  }

  /**
   * 检查是否应该输出指定级别的日志
   */
  private shouldLog(level: LogLevel): boolean {
    const levelValue = LOG_LEVELS[level];
    const currentLevelValue = LOG_LEVELS[this.currentLevel];
    return levelValue !== undefined && currentLevelValue !== undefined && levelValue >= currentLevelValue;
  }

  /**
   * 格式化日志消息
   */
  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] [${this.prefix}] ${message}`;
  }

  /**
   * 检测运行环境
   */
  private getEnvironment(): 'browser' | 'react-native' | 'node' {
    // React Native 环境检测
    if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
      return 'react-native';
    }
    // 浏览器环境检测
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      return 'browser';
    }
    // Node.js 环境
    return 'node';
  }

  /**
   * 获取控制台方法
   */
  private getConsoleMethod(level: LogLevel): (...args: any[]) => void {
    const consoleObj = console as any;
    return consoleObj[level] || console.log;
  }

  /**
   * 输出日志（支持浏览器、Node.js和React Native环境）
   */
  private output(level: LogLevel, message: string, ...args: any[]): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message);
    const environment = this.getEnvironment();
    const consoleMethod = this.getConsoleMethod(level);

    switch (environment) {
      case 'browser':
        // 浏览器环境使用颜色
        try {
          consoleMethod(
            `%c${formattedMessage}`,
            `color: ${LOG_COLORS[level]}; font-weight: bold;`,
            ...args
          );
        } catch {
          // 降级处理
          consoleMethod(formattedMessage, ...args);
        }
        break;
      
      case 'react-native':
        // React Native 环境，支持基本的console方法
        consoleMethod(`${formattedMessage}`, ...args);
        break;
      
      case 'node':
        // Node.js 环境，可以使用ANSI颜色码
        const colorCode = this.getAnsiColor(level);
        consoleMethod(`${colorCode}${formattedMessage}\x1b[0m`, ...args);
        break;
      
      default:
        // 默认处理
        consoleMethod(formattedMessage, ...args);
        break;
    }
  }

  /**
   * 获取ANSI颜色码（Node.js环境）
   */
  private getAnsiColor(level: LogLevel): string {
    const colors: Record<LogLevel, string> = {
      debug: '\x1b[90m',  // 灰色
      info: '\x1b[34m',   // 蓝色
      warn: '\x1b[33m',   // 黄色
      error: '\x1b[31m',  // 红色
    };
    return colors[level] || '';
  }

  /**
   * 调试日志
   */
  debug(message: string, ...args: any[]): void {
    this.output('debug', message, ...args);
  }

  /**
   * 信息日志
   */
  info(message: string, ...args: any[]): void {
    this.output('info', message, ...args);
  }

  /**
   * 警告日志
   */
  warn(message: string, ...args: any[]): void {
    this.output('warn', message, ...args);
  }

  /**
   * 错误日志
   */
  error(message: string, ...args: any[]): void {
    this.output('error', message, ...args);
  }
}

/**
 * 全局日志器实例
 */
const globalLogger = new DefaultLogger();

/**
 * 创建具名日志器
 */
export function createLogger(name: string): SeekSelf.Utils.Logger {
  return new DefaultLogger(name);
}

/**
 * 设置全局日志级别
 */
export function setGlobalLogLevel(level: LogLevel): void {
  globalLogger.setLevel(level);
}

/**
 * 获取全局日志级别
 */
export function getGlobalLogLevel(): LogLevel {
  return globalLogger.getLevel();
}

/**
 * React Native 专用的日志增强功能
 */
function enhanceForReactNative(): void {
  // 如果是React Native环境，可以添加一些特殊处理
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    // 在React Native中，可以考虑使用一些专门的日志库
    // 或者添加远程日志发送功能
    
    // 检查是否是开发环境
    const isDevelopment = __DEV__ !== undefined ? __DEV__ : process.env.NODE_ENV === 'development';
    
    // 在生产环境中可能需要不同的日志策略
    if (!isDevelopment) {
      globalLogger.setLevel('warn'); // 生产环境只显示警告和错误
    }
  }
}

// 初始化React Native增强功能
try {
  enhanceForReactNative();
} catch (error) {
  // 忽略初始化错误，确保在任何环境下都能正常工作
  console.warn('Logger initialization warning:', error);
}

/**
 * 全局日志方法
 */
export const logger = {
  debug: (message: string, ...args: any[]) => globalLogger.debug(message, ...args),
  info: (message: string, ...args: any[]) => globalLogger.info(message, ...args),
  warn: (message: string, ...args: any[]) => globalLogger.warn(message, ...args),
  error: (message: string, ...args: any[]) => globalLogger.error(message, ...args),
  setLevel: (level: LogLevel) => globalLogger.setLevel(level),
  getLevel: () => globalLogger.getLevel(),
  
  /**
   * 创建子日志器
   */
  child: (name: string) => createLogger(name),
  
  /**
   * 获取环境信息
   */
  getEnvironment: () => {
    const tempLogger = new DefaultLogger();
    return (tempLogger as any).getEnvironment();
  }
};

/**
 * 导出类型和接口
 */
export type { LogLevel };
export type Logger = SeekSelf.Utils.Logger;

/**
 * 默认导出全局日志器
 */
export default logger;
