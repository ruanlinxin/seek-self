import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  async create(@Body() createAdminDto: { userId: string; remark?: string }) {
    return this.adminService.create(createAdminDto.userId, createAdminDto.remark);
  }

  @Get()
  async findAll() {
    return this.adminService.findAll();
  }

  @Get('check/:userId')
  async checkAdmin(@Param('userId') userId: string) {
    return await this.adminService.isAdmin(userId);
  }

  @Delete(':userId')
  async remove(@Param('userId') userId: string) {
    return this.adminService.remove(userId);
  }

  @Post(':userId/activate')
  async activate(@Param('userId') userId: string) {
    return this.adminService.activate(userId);
  }
}