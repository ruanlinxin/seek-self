/**
 * 设备模块类型定义
 */

// 设备类型枚举
export enum DeviceType {
  BROWSER = 'browser',
  MOBILE = 'mobile',
  DESKTOP = 'desktop',
  UNKNOWN = 'unknown'
}

// 平台枚举
export enum Platform {
  WEB = 'web',
  IOS = 'ios',
  ANDROID = 'android',
  WINDOWS = 'windows',
  MACOS = 'macos',
  LINUX = 'linux',
  UNKNOWN = 'unknown'
}

// 设备信息接口
export interface DeviceInfo {
  deviceId: string;
  deviceType: DeviceType;
  platform?: Platform;
  deviceName?: string;
  deviceBrand?: string;
  osName?: string;
  osVersion?: string;
  architecture?: string;
  browserName?: string;
  browserVersion?: string;
  userAgent?: string;
  screenWidth?: number;
  screenHeight?: number;
  devicePixelRatio?: number;
  screenOrientation?: string;
  touchSupport?: boolean;
  cpuCores?: number;
  totalMemory?: number;
  networkType?: string;
  appVersion?: string;
  appBuildVersion?: string;
  language?: string;
  timezone?: string;
  extendInfo?: any;
  lastActiveAt?: Date;
  isOnline?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// 设备注册数据接口
export interface RegisterDeviceDto {
  deviceId: string;
  deviceType: DeviceType;
  platform?: Platform;
  deviceName?: string;
  deviceBrand?: string;
  osName?: string;
  osVersion?: string;
  architecture?: string;
  browserName?: string;
  browserVersion?: string;
  userAgent?: string;
  screenWidth?: number;
  screenHeight?: number;
  devicePixelRatio?: number;
  screenOrientation?: string;
  touchSupport?: boolean;
  cpuCores?: number;
  totalMemory?: number;
  networkType?: string;
  appVersion?: string;
  appBuildVersion?: string;
  language?: string;
  timezone?: string;
  extendInfo?: any;
}

// 设备更新数据接口
export interface UpdateDeviceDto {
  lastActiveAt?: Date;
  isOnline?: boolean;
  networkType?: string;
  deviceName?: string;
  appVersion?: string;
  appBuildVersion?: string;
  extendInfo?: any;
}

// 设备查询参数接口
export interface DeviceQueryParams {
  deviceType?: DeviceType;
  platform?: Platform;
  isOnline?: boolean;
  page?: number;
  limit?: number;
}

// 设备统计信息接口
export interface DeviceStatistics {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  deviceTypeStats: Array<{ deviceType: string; count: number }>;
  platformStats: Array<{ platform: string; count: number }>;
}

// 设备列表响应接口
export interface DeviceListResponse {
  devices: DeviceInfo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}