import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAppRelation } from './user-app-relation.entity';
import { UserAppRelationService } from './user-app-relation.service';
import { UserAppRelationController } from './user-app-relation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserAppRelation])],
  controllers: [UserAppRelationController],
  providers: [UserAppRelationService],
  exports: [TypeOrmModule, UserAppRelationService],
})
export class UserAppRelationModule {} 