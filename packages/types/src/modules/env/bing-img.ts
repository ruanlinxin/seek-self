/**
 * Bing图片模块类型定义
 */

export interface BingImage {
  id: string;
  date: string;
  title: string;
  url: string;
  fullUrl: string;
  copyright?: string;
  region?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
}

export interface BingImageQueryParams {
  region?: string;
  days?: number;
  date?: string;
}