import { Controller, Get, Query } from '@nestjs/common';
import { BingImgService } from './bing-img.service';

@Controller('bing-img')
export class BingImgController {
  constructor(private readonly bingImgService: BingImgService) {}

  @Get('today')
  async getTodayBingImage(@Query('region') region: string = 'zh-CN') {
    return await this.bingImgService.getTodayBingImage(region);
  }

  @Get('recent')
  async getRecentBingImages(
    @Query('days') days: number = 7,
    @Query('region') region: string = 'zh-CN',
  ) {
    return await this.bingImgService.getRecentBingImages(days, region);
  }
}
