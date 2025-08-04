import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { App } from './app.entity';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { AuthModule } from '../auth/auth.module';
import { UserAppRelationModule } from '../user/user-app-relation/user-app-relation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([App]),
    AuthModule,
    UserAppRelationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {} 