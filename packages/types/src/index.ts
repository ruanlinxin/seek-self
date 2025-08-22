/**
 * SeekSelf 类型定义包
 * 
 * 命名空间结构:
 * - SeekSelf (顶层命名空间)
 *   - Utils (工具类命名空间)
 *     - Peer (P2P 通信相关类型)
 * 
 * 使用方式:
 * import type { SeekSelf } from '@seek-self/types';
 * 
 * 类型使用:
 * - SeekSelf.User
 * - SeekSelf.Task
 * - SeekSelf.Utils.Peer.Config
 * - SeekSelf.Utils.Peer.Message
 */

// 导入命名空间定义
/// <reference path="./seek-self/index.ts" />

// 导出顶层命名空间
export * from './seek-self';

// 为了兼容性，保留旧的直接导出
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}



// 导出命名空间类型
export import SeekSelf = require('./seek-self');
