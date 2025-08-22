/**
 * 环境模块类型定义
 */

export * from './dict';
export * from './bing-img';

import { Dict } from './dict';
import { BingImage } from './bing-img';

export interface EnvSummary {
  dicts: Dict[];
  todayBingImage: BingImage;
}