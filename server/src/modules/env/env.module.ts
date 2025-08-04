import { Module } from '@nestjs/common';
import { DictModule } from './dict/dict.module';
import { EnvController } from './env.controller';

@Module({
  imports: [DictModule],
  controllers: [EnvController],
})
export class EnvModule {} 