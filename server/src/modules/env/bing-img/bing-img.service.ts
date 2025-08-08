import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { BingImage } from './bing-img.entity';

@Injectable()
export class BingImgService {
  private readonly logger = new Logger(BingImgService.name);

  constructor(
    @InjectRepository(BingImage)
    private readonly bingImageRepository: Repository<BingImage>,
  ) {}

  async getTodayBingImage(region: string = 'zh-CN'): Promise<BingImage> {
    const today = new Date().toISOString().split('T')[0];
    
    // 先从数据库查找今天的图片
    let bingImage = await this.bingImageRepository.findOne({
      where: { date: today, region },
    });

    if (!bingImage) {
      // 如果数据库中没有，从 Bing API 获取
      this.logger.log(`数据库中未找到今日图片，从 Bing API 获取 (${region})`);
      bingImage = await this.fetchFromBingAPI(region);
      
      if (bingImage) {
        // 保存到数据库
        await this.bingImageRepository.save(bingImage);
        this.logger.log(`今日图片已保存到数据库: ${bingImage.title}`);
      }
    } else {
      this.logger.log(`从数据库获取今日图片: ${bingImage.title}`);
    }

    return bingImage;
  }

  private async fetchFromBingAPI(region: string): Promise<BingImage> {
    try {
      const apiUrl = `https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=${region}`;
      const response = await axios.get(apiUrl);

      const imageData = response.data.images[0];
      const today = new Date().toISOString().split('T')[0];

      const bingImage = new BingImage();
      bingImage.date = today;
      bingImage.title = imageData.title;
      bingImage.url = imageData.url;
      bingImage.fullUrl = `https://www.bing.com${imageData.url}`;
      bingImage.copyright = imageData.copyright;
      bingImage.region = region;
      bingImage.description = imageData.description || '';

      this.logger.log(`从 Bing API 获取成功: ${bingImage.title}`);
      return bingImage;
    } catch (error) {
      this.logger.error(`从 Bing API 获取失败: ${error.message}`);
      throw new Error('获取 Bing 图片失败');
    }
  }

  async getBingImageByDate(date: string, region: string = 'zh-CN'): Promise<BingImage> {
    return await this.bingImageRepository.findOne({
      where: { date, region },
    });
  }

  async getRecentBingImages(days: number = 7, region: string = 'zh-CN'): Promise<BingImage[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await this.bingImageRepository.find({
      where: { region },
      order: { date: 'DESC' },
      take: days,
    });
  }
}
