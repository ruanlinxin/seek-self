import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { DeviceService } from './device.service';
import { CreateDeviceDto, UpdateDeviceDto, DeviceQueryDto } from './device.dto';
import { ResponseDto } from '@/common/dto/response.dto';

@UseGuards(JwtAuthGuard)
@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post('register')
  async registerDevice(@Request() req, @Body() createDeviceDto: CreateDeviceDto) {
    const device = await this.deviceService.createOrUpdateDevice(req.user.id, createDeviceDto);
    return ResponseDto.success(device, '设备注册成功');
  }

  @Put(':deviceId')
  async updateDevice(
    @Request() req,
    @Param('deviceId') deviceId: string,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ) {
    const device = await this.deviceService.updateDevice(req.user.id, deviceId, updateDeviceDto);
    return ResponseDto.success(device, '设备更新成功');
  }

  @Post(':deviceId/heartbeat')
  @HttpCode(HttpStatus.OK)
  async heartbeat(@Request() req, @Param('deviceId') deviceId: string) {
    await this.deviceService.heartbeat(req.user.id, deviceId);
    return ResponseDto.success(null, '心跳成功');
  }

  @Post(':deviceId/online')
  @HttpCode(HttpStatus.OK)
  async setOnline(@Request() req, @Param('deviceId') deviceId: string) {
    await this.deviceService.updateDeviceOnlineStatus(req.user.id, deviceId, true);
    return ResponseDto.success(null, '设备已上线');
  }

  @Post(':deviceId/offline')
  @HttpCode(HttpStatus.OK)
  async setOffline(@Request() req, @Param('deviceId') deviceId: string) {
    await this.deviceService.updateDeviceOnlineStatus(req.user.id, deviceId, false);
    return ResponseDto.success(null, '设备已离线');
  }

  @Get()
  async getUserDevices(@Request() req, @Query() queryDto: DeviceQueryDto) {
    const result = await this.deviceService.getUserDevices(req.user.id, queryDto);
    return ResponseDto.success(result, '获取设备列表成功');
  }

  @Get('statistics')
  async getDeviceStatistics(@Request() req) {
    const statistics = await this.deviceService.getDeviceStatistics(req.user.id);
    return ResponseDto.success(statistics, '获取设备统计成功');
  }

  @Get(':deviceId')
  async getDeviceById(@Request() req, @Param('deviceId') deviceId: string) {
    const device = await this.deviceService.getDeviceById(req.user.id, deviceId);
    return ResponseDto.success(device, '获取设备详情成功');
  }

  @Delete(':deviceId')
  async deleteDevice(@Request() req, @Param('deviceId') deviceId: string) {
    await this.deviceService.deleteDevice(req.user.id, deviceId);
    return ResponseDto.success(null, '设备删除成功');
  }
}