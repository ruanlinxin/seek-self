/**
 * 应用模块类型定义
 */

// 应用状态枚举
export enum AppStatus {
  DISABLED = 0,
  ENABLED = 1
}

// 应用类型枚举
export enum AppType {
  WEB = 'web',
  WIDGET = 'widget',
  COMPONENT = 'component',
  EXTERNAL = 'external'
}

// 应用基础信息接口
export interface App {
  id: string;
  group: string;
  name: string;
  description?: string;
  icon?: string;
  status: AppStatus;
  orderNo: number;
  version?: string;
  entryUrl?: string;
  isSystem: boolean;
  appExtend?: any;
  componentKey?: string;
  appType?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
}

// 应用分组信息接口
export interface AppGroup {
  group: string;
  apps: App[];
}

// 应用盒子响应接口（按分组返回）
export interface AppBoxResponse {
  groups: AppGroup[];
}

// 扩展的应用信息接口（包含用户关系）
export interface AppWithRelation extends App {
  favoriteAt: Date | null;
  usedAt: Date | null;
}

// === DTO 类型定义 ===

// 创建应用DTO
export interface CreateAppDto {
  group: string;
  name: string;
  description?: string;
  icon?: string;
  status?: AppStatus;
  orderNo?: number;
  version?: string;
  entryUrl?: string;
  isSystem?: boolean;
  appExtend?: any;
  componentKey?: string;
  appType?: string;
}

// 更新应用DTO
export interface UpdateAppDto {
  group?: string;
  name?: string;
  description?: string;
  icon?: string;
  status?: AppStatus;
  orderNo?: number;
  version?: string;
  entryUrl?: string;
  isSystem?: boolean;
  appExtend?: any;
  componentKey?: string;
  appType?: string;
}

// 应用查询参数接口（基础查询，当前服务端暂未实现）
export interface AppQueryParams {
  // 预留扩展字段，服务端当前无查询参数
  [key: string]: any;
}

// 删除应用响应接口
export interface DeleteAppResponse {
  message: string;
}

// 应用列表响应类型（根据不同接口的实际返回）
export type AppListResponse = App[]; // 普通应用列表
export type AppWithRelationListResponse = AppWithRelation[]; // 带关系的应用列表