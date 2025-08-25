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
import { TokenUserId } from '@/common/decorators/token.decorator';

@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @UseGuards(JwtAuthGuard)
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
  async heartbeat(
    @TokenUserId() userId: string | null,
    @Param('deviceId') deviceId: string,
    @Body() deviceInfo?: CreateDeviceDto
  ) {
    const device = await this.deviceService.heartbeatWithAutoRegister(userId, deviceId, deviceInfo);
    return ResponseDto.success(device, '心跳成功');
  }

  @Post(':deviceId/online')
  @HttpCode(HttpStatus.OK)
  async setOnline(
    @TokenUserId() userId: string | null,
    @Param('deviceId') deviceId: string,
    @Body() deviceInfo?: CreateDeviceDto
  ) {
    const device = await this.deviceService.setOnlineWithAutoRegister(userId, deviceId, true, deviceInfo);
    return ResponseDto.success(device, '设备已上线');
  }

  @Post(':deviceId/offline')
  @HttpCode(HttpStatus.OK)
  async setOffline(
    @TokenUserId() userId: string | null,
    @Param('deviceId') deviceId: string
  ) {
    await this.deviceService.updateDeviceOnlineStatus(userId, deviceId, false);
    return ResponseDto.success(null, '设备已离线');
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserDevices(@Request() req, @Query() queryDto: DeviceQueryDto) {
    const result = await this.deviceService.getUserDevices(req.user.id, queryDto);
    return ResponseDto.success(result, '获取设备列表成功');
  }

  @UseGuards(JwtAuthGuard)
  @Get('statistics')
  async getDeviceStatistics(@Request() req) {
    const statistics = await this.deviceService.getDeviceStatistics(req.user.id);
    return ResponseDto.success(statistics, '获取设备统计成功');
  }

  @Get(':deviceId')
  async getDeviceById(
    @TokenUserId() userId: string | null,
    @Param('deviceId') deviceId: string
  ) {
    const device = await this.deviceService.getDeviceById(userId, deviceId);
    return ResponseDto.success(device, '获取设备详情成功');
  }

  @Delete(':deviceId')
  async deleteDevice(
    @TokenUserId() userId: string | null,
    @Param('deviceId') deviceId: string
  ) {
    await this.deviceService.deleteDevice(userId, deviceId);
    return ResponseDto.success(null, '设备删除成功');
  }
}