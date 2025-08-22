import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsDateString } from 'class-validator';

export enum DeviceType {
  BROWSER = 'browser',
  MOBILE = 'mobile',
  DESKTOP = 'desktop',
}

export enum Platform {
  WEB = 'web',
  IOS = 'ios',
  ANDROID = 'android',
  WINDOWS = 'windows',
  MACOS = 'macos',
  LINUX = 'linux',
}

export class CreateDeviceDto {
  @IsString()
  deviceId: string;

  @IsEnum(DeviceType)
  deviceType: DeviceType;

  @IsOptional()
  @IsEnum(Platform)
  platform?: Platform;

  @IsOptional()
  @IsString()
  deviceName?: string;

  @IsOptional()
  @IsString()
  deviceBrand?: string;

  @IsOptional()
  @IsString()
  osName?: string;

  @IsOptional()
  @IsString()
  osVersion?: string;

  @IsOptional()
  @IsString()
  architecture?: string;

  @IsOptional()
  @IsString()
  browserName?: string;

  @IsOptional()
  @IsString()
  browserVersion?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsNumber()
  screenWidth?: number;

  @IsOptional()
  @IsNumber()
  screenHeight?: number;

  @IsOptional()
  @IsNumber()
  devicePixelRatio?: number;

  @IsOptional()
  @IsString()
  screenOrientation?: string;

  @IsOptional()
  @IsBoolean()
  touchSupport?: boolean;

  @IsOptional()
  @IsNumber()
  cpuCores?: number;

  @IsOptional()
  @IsNumber()
  totalMemory?: number;

  @IsOptional()
  @IsString()
  networkType?: string;

  @IsOptional()
  @IsString()
  appVersion?: string;

  @IsOptional()
  @IsString()
  appBuildVersion?: string;



  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  extendInfo?: any;
}

export class UpdateDeviceDto {
  @IsOptional()
  @IsDateString()
  lastActiveAt?: Date;

  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;

  @IsOptional()
  @IsString()
  networkType?: string;

  @IsOptional()
  extendInfo?: any;
}

export class DeviceQueryDto {
  @IsOptional()
  @IsEnum(DeviceType)
  deviceType?: DeviceType;

  @IsOptional()
  @IsEnum(Platform)
  platform?: Platform;

  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;

  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 10;
}