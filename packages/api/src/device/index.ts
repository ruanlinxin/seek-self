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

/**
 * 设备 API 类
 */
export class DeviceAPI {
  private static baseUrl = '/device';

  /**
   * 注册或更新设备信息
   */
  static async register(deviceInfo: RegisterDeviceDto): Result<DeviceInfo> {
    return request({
      url: `${this.baseUrl}/register`,
      method: 'POST',
      data: deviceInfo
    });
  }

  /**
   * 更新设备信息
   */
  static async update(deviceId: string, updateData: UpdateDeviceDto): Result<DeviceInfo> {
    return request({
      url: `${this.baseUrl}/${deviceId}`,
      method: 'PUT',
      data: updateData
    });
  }

  /**
   * 设备心跳检测
   */
  static async heartbeat(deviceId: string): Result<void> {
    return request({
      url: `${this.baseUrl}/${deviceId}/heartbeat`,
      method: 'POST'
    });
  }

  /**
   * 设置设备在线状态
   */
  static async setOnline(deviceId: string): Result<void> {
    return request({
      url: `${this.baseUrl}/${deviceId}/online`,
      method: 'POST'
    });
  }

  /**
   * 设置设备离线状态
   */
  static async setOffline(deviceId: string): Result<void> {
    return request({
      url: `${this.baseUrl}/${deviceId}/offline`,
      method: 'POST'
    });
  }

  /**
   * 获取用户设备列表
   */
  static async getList(params?: DeviceQueryParams): Result<DeviceListResponse> {
    return request({
      url: this.baseUrl,
      method: 'GET',
      params
    });
  }

  /**
   * 获取设备统计信息
   */
  static async getStatistics(): Result<DeviceStatistics> {
    return request({
      url: `${this.baseUrl}/statistics`,
      method: 'GET'
    });
  }

  /**
   * 获取设备详情
   */
  static async getById(deviceId: string): Result<DeviceInfo> {
    return request({
      url: `${this.baseUrl}/${deviceId}`,
      method: 'GET'
    });
  }

  /**
   * 删除设备
   */
  static async delete(deviceId: string): Result<void> {
    return request({
      url: `${this.baseUrl}/${deviceId}`,
      method: 'DELETE'
    });
  }
}

/**
 * 便捷的设备 API 方法（可直接使用）
 */

/**
 * 注册设备
 */
export const registerDevice = (deviceInfo: RegisterDeviceDto): Result<DeviceInfo> => {
  return DeviceAPI.register(deviceInfo);
};

/**
 * 更新设备信息
 */
export const updateDevice = (deviceId: string, updateData: UpdateDeviceDto): Result<DeviceInfo> => {
  return DeviceAPI.update(deviceId, updateData);
};

/**
 * 设备心跳
 */
export const deviceHeartbeat = (deviceId: string): Result<void> => {
  return DeviceAPI.heartbeat(deviceId);
};

/**
 * 设置设备在线
 */
export const setDeviceOnline = (deviceId: string): Result<void> => {
  return DeviceAPI.setOnline(deviceId);
};

/**
 * 设置设备离线
 */
export const setDeviceOffline = (deviceId: string): Result<void> => {
  return DeviceAPI.setOffline(deviceId);
};

/**
 * 获取设备列表
 */
export const getDeviceList = (params?: DeviceQueryParams): Result<DeviceListResponse> => {
  return DeviceAPI.getList(params);
};

/**
 * 获取设备统计
 */
export const getDeviceStatistics = (): Result<DeviceStatistics> => {
  return DeviceAPI.getStatistics();
};

/**
 * 获取设备详情
 */
export const getDeviceById = (deviceId: string): Result<DeviceInfo> => {
  return DeviceAPI.getById(deviceId);
};

/**
 * 删除设备
 */
export const deleteDevice = (deviceId: string): Result<void> => {
  return DeviceAPI.delete(deviceId);
};

// 默认导出
export default DeviceAPI;

