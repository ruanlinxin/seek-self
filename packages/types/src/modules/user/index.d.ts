/**
 * 用户模块类型定义
 */

// 性别枚举
export enum Gender {
  UNKNOWN = 0,
  MALE = 1,
  FEMALE = 2
}

// 用户基础信息接口
export interface User {
  id: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
}

// 用户资料接口
export interface UserProfile {
  userId: string;
  nickname: string;
  avatar?: string;
  gender: Gender;
  bio?: string;
  birth?: Date;
}

// 用户完整信息接口（包含资料）
export interface UserInfo extends User {
  profile?: UserProfile;
}

// 用户应用关系接口
export interface UserAppRelation {
  id: string;
  userId: string;
  appId: string;
  usedAt?: Date;
  favoriteAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
}

// === DTO 类型定义 ===

// 用户注册DTO
export interface CreateUserDto {
  username: string;
  password: string;
}

// 用户登录DTO
export interface LoginUserDto {
  username: string;
  password: string;
}

// 更新用户资料DTO
export interface UpdateUserProfileDto {
  nickname?: string;
  avatar?: string;
  gender?: Gender;
  bio?: string;
  birth?: Date;
}

// === 响应类型定义 ===

// 登录响应
export interface LoginResponse {
  access_token: string;
}

// 用户应用关系操作DTO
export interface UserAppRelationDto {
  appId: string;
}

// 获取最近使用应用的查询参数
export interface GetRecentAppsParams {
  limit?: number;
}