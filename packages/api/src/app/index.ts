/**
 * 应用模块 API
 * 提供应用的增删改查、分组管理等功能
 */

import { request } from '../index';
import type {
  App,
  AppStatus,
  AppType,
  AppGroup,
  AppBoxResponse,
  AppWithRelation,
  CreateAppDto,
  UpdateAppDto,
  AppQueryParams,
  AppListResponse,
  AppWithRelationListResponse,
  DeleteAppResponse
} from '@seek-self/types/src/modules/app';
import type { Result } from '@seek-self/types/src/base';

// 重新导出类型以便其他地方使用
export type {
  App,
  AppStatus,
  AppType,
  AppGroup,
  AppBoxResponse,
  AppWithRelation,
  CreateAppDto,
  UpdateAppDto,
  AppQueryParams,
  AppListResponse,
  AppWithRelationListResponse,
  DeleteAppResponse
} from '@seek-self/types/src/modules/app';

// === 应用基础接口 ===

/**
 * 创建应用
 */
export const createApp = (appData: CreateAppDto): Result<App> => {
  return request({
    url: '/app',
    method: 'POST',
    data: appData
  });
};

/**
 * 获取所有应用
 */
export const getAllApps = (): Result<App[]> => {
  return request({
    url: '/app',
    method: 'GET'
  });
};

/**
 * 获取应用盒子（带用户关系信息）
 */
export const getAppBox = (): Result<AppWithRelationListResponse> => {
  return request({
    url: '/app/box',
    method: 'GET'
  });
};

/**
 * 获取启用的应用
 */
export const getEnabledApps = (): Result<App[]> => {
  return request({
    url: '/app/enabled',
    method: 'GET'
  });
};

/**
 * 根据ID获取应用详情
 */
export const getAppById = (id: string): Result<App> => {
  return request({
    url: `/app/${id}`,
    method: 'GET'
  });
};

/**
 * 更新应用
 */
export const updateApp = (id: string, updateData: UpdateAppDto): Result<App> => {
  return request({
    url: `/app/${id}`,
    method: 'PATCH',
    data: updateData
  });
};

/**
 * 删除应用
 */
export const deleteApp = (id: string): Result<DeleteAppResponse> => {
  return request({
    url: `/app/${id}`,
    method: 'DELETE'
  });
};

/**
 * 根据条件查询应用列表
 */
export const getAppList = (params?: AppQueryParams): Result<AppListResponse> => {
  return request({
    url: '/app',
    method: 'GET',
    params
  });
};

// === 应用API类 ===

export class AppAPI {
  static create = createApp;
  static getAll = getAllApps;
  static getBox = getAppBox;
  static getEnabled = getEnabledApps;
  static getById = getAppById;
  static update = updateApp;
  static delete = deleteApp;
  static getList = getAppList;
}

// 默认导出
export default AppAPI;