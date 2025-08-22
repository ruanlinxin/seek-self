/**
 * 用户模块 API
 * 提供用户注册、登录、资料管理、应用关系等功能
 */

import { request } from '../index';
import type {
  User,
  UserProfile,
  UserInfo,
  UserAppRelation,
  CreateUserDto,
  LoginUserDto,
  UpdateUserProfileDto,
  LoginResponse,
  UserAppRelationDto,
  GetRecentAppsParams
} from '@seek-self/types/src/modules/user';
import type { Result } from '@seek-self/types/src/base';

// 重新导出类型以便其他地方使用
export type {
  User,
  UserProfile,
  UserInfo,
  UserAppRelation,
  CreateUserDto,
  LoginUserDto,
  UpdateUserProfileDto,
  LoginResponse,
  UserAppRelationDto,
  GetRecentAppsParams
} from '@seek-self/types/src/modules/user';

// === 用户基础接口 ===

/**
 * 用户注册
 */
export const registerUser = (userData: CreateUserDto): Result<{ message: string }> => {
  return request({
    url: '/user/register',
    method: 'POST',
    data: userData
  });
};

/**
 * 用户登录
 */
export const loginUser = (credentials: LoginUserDto): Result<LoginResponse> => {
  return request({
    url: '/user/login',
    method: 'POST',
    data: credentials
  });
};

/**
 * 获取用户资料
 */
export const getUserProfile = (): Result<UserInfo> => {
  return request({
    url: '/user/profile',
    method: 'GET'
  });
};

/**
 * 更新用户资料
 */
export const updateUserProfile = (profileData: UpdateUserProfileDto): Result<{ message: string }> => {
  return request({
    url: '/user/profile',
    method: 'PATCH',
    data: profileData
  });
};

// === 用户应用关系接口 ===

/**
 * 收藏应用
 */
export const favoriteApp = (appId: string): Result<UserAppRelation> => {
  return request({
    url: '/user-app-relation/favorite',
    method: 'POST',
    data: { appId }
  });
};

/**
 * 取消收藏应用
 */
export const unfavoriteApp = (appId: string): Result<UserAppRelation> => {
  return request({
    url: '/user-app-relation/unfavorite',
    method: 'POST',
    data: { appId }
  });
};

/**
 * 记录应用使用
 */
export const recordAppUsed = (appId: string): Result<UserAppRelation> => {
  return request({
    url: '/user-app-relation/used',
    method: 'POST',
    data: { appId }
  });
};

/**
 * 获取收藏的应用
 */
export const getFavoriteApps = (): Result<UserAppRelation[]> => {
  return request({
    url: '/user-app-relation/favorites',
    method: 'GET'
  });
};

/**
 * 获取最近使用的应用
 */
export const getRecentApps = (params?: GetRecentAppsParams): Result<UserAppRelation[]> => {
  return request({
    url: '/user-app-relation/recent',
    method: 'GET',
    params
  });
};

// === 用户API类 ===

export class UserAPI {
  static register = registerUser;
  static login = loginUser;
  static getProfile = getUserProfile;
  static updateProfile = updateUserProfile;
}

// === 用户应用关系API类 ===

export class UserAppRelationAPI {
  static favorite = favoriteApp;
  static unfavorite = unfavoriteApp;
  static recordUsed = recordAppUsed;
  static getFavorites = getFavoriteApps;
  static getRecent = getRecentApps;
}

// 默认导出
export default UserAPI;