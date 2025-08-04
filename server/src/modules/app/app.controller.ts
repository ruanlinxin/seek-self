import { Controller, Post, Get, Patch, Delete, Param, Body, Request, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { isAdmin } from '@/common/tools';
import { JwtService } from '@nestjs/jwt';
import { CurrentUserId } from '@/common/decorators/user.decorator';

@Controller('app')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly jwtService: JwtService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() body) {
    return this.appService.create({ ...body, createdBy: req.user.id, updatedBy: req.user.id });
  }

  @Get()
  async findAll() {
    return this.appService.findAll();
  }


  @Get('box')
  async getGroup(@CurrentUserId() userId: string) {
    return this.appService.getApp(userId);
  }

  @Get('enabled')
  async findEnabledApps(@Request() req) {
    let userId: string | undefined;
    
    // 尝试从Authorization头解析JWT token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const payload = this.jwtService.verify(token);
        userId = payload.id;
      } catch (error) {
        // JWT解析失败，忽略错误，继续执行
      }
    }
    
    const adminStatus = isAdmin(userId);
    return this.appService.findEnabledApps(adminStatus);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.appService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Request() req, @Param('id') id: string, @Body() body) {
    return this.appService.update(id, { ...body, updatedBy: req.user.id });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.appService.remove(id);
  }

} 