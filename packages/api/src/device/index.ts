/**
 * 设备管理 API
 * 提供设备注册、查询、更新、统计等功能
 */

import { request } from '../index';
import type {
  DeviceType,
  Platform,
  DeviceInfo,
  RegisterDeviceDto,
  UpdateDeviceDto,
  DeviceQueryParams,
  DeviceStatistics,
  DeviceListResponse
} from '@seek-self/types/src/modules/device';
import type { Result } from '@seek-self/types/src/base';

// 重新导出类型以便其他地方使用
export type {
  DeviceType,
  Platform,
  DeviceInfo,
  RegisterDeviceDto,
  UpdateDeviceDto,
  DeviceQueryParams,
  DeviceStatistics,
  DeviceListResponse
} from '@seek-self/types/src/modules/device';

// === 设备管理接口 ===

/**
 * 更新设备信息
 */
export const updateDevice = (deviceId: string, updateData: UpdateDeviceDto): Result<DeviceInfo> => {
  return request({
    url: `/device/${deviceId}`,
    method: 'PUT',
    data: updateData
  });
};

/**
 * 设备心跳检测（支持自动注册）
 */
export const deviceHeartbeat = (deviceId: string, deviceInfo?: RegisterDeviceDto): Result<DeviceInfo | null> => {
  return request({
    url: `/device/${deviceId}/heartbeat`,
    method: 'POST',
    data: deviceInfo
  });
};

/**
 * 设置设备在线状态（支持自动注册）
 */
export const setDeviceOnline = (deviceId: string, deviceInfo?: RegisterDeviceDto): Result<DeviceInfo | null> => {
  return request({
    url: `/device/${deviceId}/online`,
    method: 'POST',
    data: deviceInfo
  });
};

/**
 * 设置设备离线状态
 */
export const setDeviceOffline = (deviceId: string): Result<void> => {
  return request({
    url: `/device/${deviceId}/offline`,
    method: 'POST'
  });
};

/**
 * 获取用户设备列表
 */
export const getDeviceList = (params?: DeviceQueryParams): Result<DeviceListResponse> => {
  return request({
    url: '/device',
    method: 'GET',
    params
  });
};

/**
 * 获取设备统计信息
 */
export const getDeviceStatistics = (): Result<DeviceStatistics> => {
  return request({
    url: '/device/statistics',
    method: 'GET'
  });
};

/**
 * 获取设备详情
 */
export const getDeviceById = (deviceId: string): Result<DeviceInfo> => {
  return request({
    url: `/device/${deviceId}`,
    method: 'GET'
  });
};

/**
 * 删除设备
 */
export const deleteDevice = (deviceId: string): Result<void> => {
  return request({
    url: `/device/${deviceId}`,
    method: 'DELETE'
  });
};

// === 设备API类 ===

export class DeviceAPI {
  static update = updateDevice;
  static heartbeat = deviceHeartbeat;
  static setOnline = setDeviceOnline;
  static setOffline = setDeviceOffline;
  static getList = getDeviceList;
  static getStatistics = getDeviceStatistics;
  static getById = getDeviceById;
  static delete = deleteDevice;
}

// 默认导出
export default DeviceAPI;