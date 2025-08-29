import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserProfile } from './user-profile.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from '../auth/auth.module';
import { UserAppRelationModule } from './user-app-relation/user-app-relation.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile]),
    AuthModule,
    UserAppRelationModule,
    AdminModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, AdminModule],
})
export class UserModule {} 