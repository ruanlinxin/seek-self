import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from './device.entity';
import { CreateDeviceDto, UpdateDeviceDto, DeviceQueryDto } from './device.dto';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
  ) {}

  /**
   * 创建或更新设备信息
   * 如果设备已存在则更新，否则创建新设备
   */
  async createOrUpdateDevice(userId: string, createDeviceDto: CreateDeviceDto): Promise<Device> {
    const { deviceId, ...deviceInfo } = createDeviceDto;

    // 查找是否已存在该设备
    let device = await this.deviceRepository.findOne({
      where: { userId, deviceId },
    });

    if (device) {
      // 更新现有设备信息
      Object.assign(device, {
        ...deviceInfo,
        lastActiveAt: new Date(),
        isOnline: true,
        updatedBy: userId,
      });
    } else {
      // 创建新设备
      device = this.deviceRepository.create({
        userId,
        deviceId,
        ...deviceInfo,
        lastActiveAt: new Date(),
        isOnline: true,
        createdBy: userId,
      });
    }

    return await this.deviceRepository.save(device);
  }

  /**
   * 更新设备状态
   */
  async updateDevice(userId: string, deviceId: string, updateDeviceDto: UpdateDeviceDto): Promise<Device> {
    const device = await this.deviceRepository.findOne({
      where: { userId, deviceId },
    });

    if (!device) {
      throw new NotFoundException('设备不存在');
    }

    Object.assign(device, {
      ...updateDeviceDto,
      updatedBy: userId,
    });

    return await this.deviceRepository.save(device);
  }

  /**
   * 更新设备在线状态
   */
  async updateDeviceOnlineStatus(userId: string, deviceId: string, isOnline: boolean): Promise<void> {
    await this.deviceRepository.update(
      { userId, deviceId },
      {
        isOnline,
        lastActiveAt: new Date(),
        updatedBy: userId,
      },
    );
  }

  /**
   * 获取用户的所有设备
   */
  async getUserDevices(userId: string, queryDto: DeviceQueryDto) {
    const { deviceType, platform, isOnline, page = 1, limit = 10 } = queryDto;

    const queryBuilder = this.deviceRepository.createQueryBuilder('device')
      .where('device.userId = :userId', { userId })
      .orderBy('device.lastActiveAt', 'DESC');

    if (deviceType) {
      queryBuilder.andWhere('device.deviceType = :deviceType', { deviceType });
    }

    if (platform) {
      queryBuilder.andWhere('device.platform = :platform', { platform });
    }

    if (isOnline !== undefined) {
      queryBuilder.andWhere('device.isOnline = :isOnline', { isOnline });
    }

    const [devices, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      devices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 获取单个设备详情
   */
  async getDeviceById(userId: string, deviceId: string): Promise<Device> {
    const device = await this.deviceRepository.findOne({
      where: { userId, deviceId },
    });

    if (!device) {
      throw new NotFoundException('设备不存在');
    }

    return device;
  }

  /**
   * 删除设备
   */
  async deleteDevice(userId: string, deviceId: string): Promise<void> {
    const result = await this.deviceRepository.softDelete({
      userId,
      deviceId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('设备不存在');
    }
  }

  /**
   * 批量更新设备离线状态（用于定时任务）
   */
  async updateOfflineDevices(offlineThresholdMinutes: number = 5): Promise<void> {
    const thresholdTime = new Date(Date.now() - offlineThresholdMinutes * 60 * 1000);
    
    await this.deviceRepository.update(
      {
        isOnline: true,
        lastActiveAt: { $lt: thresholdTime } as any,
      },
      { isOnline: false },
    );
  }

  /**
   * 获取设备统计信息
   */
  async getDeviceStatistics(userId: string) {
    const [
      totalDevices,
      onlineDevices,
      deviceTypeStats,
      platformStats,
    ] = await Promise.all([
      this.deviceRepository.count({ where: { userId } }),
      this.deviceRepository.count({ where: { userId, isOnline: true } }),
      this.deviceRepository
        .createQueryBuilder('device')
        .select('device.deviceType', 'deviceType')
        .addSelect('COUNT(*)', 'count')
        .where('device.userId = :userId', { userId })
        .groupBy('device.deviceType')
        .getRawMany(),
      this.deviceRepository
        .createQueryBuilder('device')
        .select('device.platform', 'platform')
        .addSelect('COUNT(*)', 'count')
        .where('device.userId = :userId', { userId })
        .andWhere('device.platform IS NOT NULL')
        .groupBy('device.platform')
        .getRawMany(),
    ]);

    return {
      totalDevices,
      onlineDevices,
      offlineDevices: totalDevices - onlineDevices,
      deviceTypeStats,
      platformStats,
    };
  }

  /**
   * 心跳检测 - 更新设备活跃时间
   */
  async heartbeat(userId: string, deviceId: string): Promise<void> {
    await this.deviceRepository.update(
      { userId, deviceId },
      {
        lastActiveAt: new Date(),
        isOnline: true,
      },
    );
  }
}