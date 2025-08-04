import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { UserAppRelationService } from './user-app-relation.service';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { CurrentUserId } from '@/common/decorators/user.decorator';

@Controller('user-app-relation')
export class UserAppRelationController {
  constructor(private readonly relationService: UserAppRelationService) {}

  @UseGuards(JwtAuthGuard)
  @Post('favorite')
  favorite(@CurrentUserId() userId: string, @Body('appId') appId: string) {
    return this.relationService.favorite(userId, appId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('unfavorite')
  unfavorite(@CurrentUserId() userId: string, @Body('appId') appId: string) {
    return this.relationService.unfavorite(userId, appId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('used')
  recordUsed(@CurrentUserId() userId: string, @Body('appId') appId: string) {
    return this.relationService.recordUsed(userId, appId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('favorites')
  getFavorites(@CurrentUserId() userId: string) {
    return this.relationService.getFavorites(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('recent')
  getRecent(@CurrentUserId() userId: string, @Query('limit') limit?: number) {
    return this.relationService.getRecent(userId, limit);
  }
} 