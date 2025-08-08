import { Module } from '@nestjs/common';
import { DictModule } from './dict/dict.module';
import { BingImgModule } from './bing-img/bing-img.module';
import { EnvController } from './env.controller';

@Module({
  imports: [DictModule, BingImgModule],
  controllers: [EnvController],
})
export class EnvModule {} 