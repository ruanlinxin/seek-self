import { Controller, Get } from '@nestjs/common';
import { DictService } from './dict/dict.service';

@Controller('env')
export class EnvController {
  constructor(private readonly dictService: DictService) {}

  @Get('summary')
  async getEnvSummary() {
    const dicts = await this.dictService.findAllEnabled();
    return { dicts };
  }
} 