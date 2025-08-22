/**
 * 字典模块类型定义
 */

export interface Dict {
  id: string;
  type: string;
  key: string;
  value: string;
  description?: string;
  enabled: boolean;
  orderNo: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
}

export interface CreateDictDto {
  type: string;
  key: string;
  value: string;
  description?: string;
  enabled?: boolean;
  orderNo?: number;
}

export interface UpdateDictDto {
  type?: string;
  key?: string;
  value?: string;
  description?: string;
  enabled?: boolean;
  orderNo?: number;
}

export interface DictQueryParams {
  type?: string;
  enabled?: boolean;
}