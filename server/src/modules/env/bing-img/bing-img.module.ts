import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BingImgController } from './bing-img.controller';
import { BingImgService } from './bing-img.service';
import { BingImage } from './bing-img.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BingImage]),
  ],
  controllers: [BingImgController],
  providers: [BingImgService],
  exports: [BingImgService],
})
export class BingImgModule {}
