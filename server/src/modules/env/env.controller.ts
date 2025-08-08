import { Controller, Get } from '@nestjs/common';
import { DictService } from './dict/dict.service';
import { BingImgService } from './bing-img/bing-img.service';

@Controller('env')
export class EnvController {
  constructor(
    private readonly dictService: DictService,
    private readonly bingImgService: BingImgService,
  ) {}

  @Get('summary')
  async getEnvSummary() {
    const dicts = await this.dictService.findAllEnabled();
    const todayBingImage = await this.bingImgService.getTodayBingImage();
    
    return { 
      dicts,
      todayBingImage,
    };
  }
} 