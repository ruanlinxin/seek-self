/**
 * 环境模块 API
 */

import { request } from '../index';
import type { 
  Dict, 
  CreateDictDto, 
  UpdateDictDto, 
  DictQueryParams,
  BingImage, 
  BingImageQueryParams,
  EnvSummary
} from '@seek-self/types/src/modules/env';
import type { Result } from '@seek-self/types/src/base';

// === 环境汇总接口 ===

/**
 * 获取环境汇总信息
 */
export const getEnvSummary = (): Result<EnvSummary> => {
  return request({
    url: '/env/summary',
    method: 'GET'
  });
};

// === 字典管理接口 ===

/**
 * 创建字典项
 */
export const createDict = (data: CreateDictDto): Result<Dict> => {
  return request({
    url: '/env/dict',
    method: 'POST',
    data
  });
};

/**
 * 获取所有字典项
 */
export const getAllDicts = (): Result<Dict[]> => {
  return request({
    url: '/env/dict',
    method: 'GET'
  });
};

/**
 * 获取启用的字典项
 */
export const getEnabledDicts = (): Result<Dict[]> => {
  return request({
    url: '/env/dict/enabled',
    method: 'GET'
  });
};

/**
 * 根据类型获取字典项
 */
export const getDictsByType = (type: string): Result<Dict[]> => {
  return request({
    url: `/env/dict/type/${type}`,
    method: 'GET'
  });
};

/**
 * 根据ID获取字典项
 */
export const getDictById = (id: string): Result<Dict> => {
  return request({
    url: `/env/dict/${id}`,
    method: 'GET'
  });
};

/**
 * 更新字典项
 */
export const updateDict = (id: string, data: UpdateDictDto): Result<Dict> => {
  return request({
    url: `/env/dict/${id}`,
    method: 'PATCH',
    data
  });
};

/**
 * 删除字典项
 */
export const deleteDict = (id: string): Result<void> => {
  return request({
    url: `/env/dict/${id}`,
    method: 'DELETE'
  });
};

// === Bing图片接口 ===

/**
 * 获取今日Bing图片
 */
export const getTodayBingImage = (region: string = 'zh-CN'): Result<BingImage> => {
  return request({
    url: '/bing-img/today',
    method: 'GET',
    params: { region }
  });
};

/**
 * 获取最近的Bing图片
 */
export const getRecentBingImages = (params?: BingImageQueryParams): Result<BingImage[]> => {
  return request({
    url: '/bing-img/recent',
    method: 'GET',
    params: {
      days: params?.days || 7,
      region: params?.region || 'zh-CN'
    }
  });
};

// === 字典API类 ===

export class DictAPI {
  static create = createDict;
  static getAll = getAllDicts;
  static getEnabled = getEnabledDicts;
  static getByType = getDictsByType;
  static getById = getDictById;
  static update = updateDict;
  static delete = deleteDict;
}

// === Bing图片API类 ===

export class BingImageAPI {
  static getToday = getTodayBingImage;
  static getRecent = getRecentBingImages;
}

// === 环境API类 ===

export class EnvAPI {
  static getSummary = getEnvSummary;
  static Dict = DictAPI;
  static BingImage = BingImageAPI;
}

// 默认导出
export default EnvAPI;