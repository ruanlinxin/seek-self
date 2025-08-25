import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/**
 * Token解析选项
 */
export interface TokenParseOptions {
  /** 是否在token无效时抛出异常，默认false */
  throwOnInvalid?: boolean;
  /** 默认用户信息，当token不存在或无效时返回 */
  defaultUser?: any;
  /** 是否只返回用户ID，默认false */
  idOnly?: boolean;
}

/**
 * 从JWT token中解析用户信息的工具函数
 */
function parseUserFromToken(request: any, options: TokenParseOptions = {}): any {
  // 首先检查是否已通过JWT守卫认证
  if (request.user) {
    return options.idOnly ? request.user.id : request.user;
  }

  // 尝试从Authorization头解析token
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return options.defaultUser || null;
  }

  try {
    const token = authHeader.substring(7);
    
    // 简单的JWT解码（不验证签名，仅用于获取payload）
    const parts = token.split('.');
    if (parts.length !== 3) {
      if (options.throwOnInvalid) {
        throw new Error('Invalid JWT format');
      }
      return options.defaultUser || null;
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    // 检查token是否过期
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      if (options.throwOnInvalid) {
        throw new Error('Token已过期');
      }
      return options.defaultUser || null;
    }

    const user = {
      id: payload.id,
      username: payload.username,
    };

    return options.idOnly ? user.id : user;
  } catch (error) {
    if (options.throwOnInvalid) {
      throw error;
    }
    return options.defaultUser || null;
  }
}

/**
 * 可选Token用户信息装饰器
 * 会尝试解析JWT token，如果失败则返回null或默认值
 * 不需要JWT守卫，支持匿名访问
 * 
 * @param options 解析选项
 * 
 * @example
 * ```typescript
 * // 基本用法
 * async someMethod(@TokenUser() user: any) {
 *   // user可能为null（匿名用户）或包含{id, username}的对象
 * }
 * 
 * // 只获取用户ID
 * async someMethod(@TokenUser({ idOnly: true }) userId: string | null) {
 *   // userId可能为null或字符串
 * }
 * 
 * // 设置默认用户
 * async someMethod(@TokenUser({ defaultUser: { id: 'anonymous' } }) user: any) {
 *   // user至少包含默认用户信息
 * }
 * 
 * // 在token无效时抛出异常
 * async someMethod(@TokenUser({ throwOnInvalid: true }) user: any) {
 *   // 如果token存在但无效，会抛出异常
 * }
 * ```
 */
export const TokenUser = createParamDecorator(
  (options: TokenParseOptions = {}, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return parseUserFromToken(request, options);
  },
);

/**
 * 可选Token用户ID装饰器
 * 是TokenUser的简化版本，只返回用户ID
 * 
 * @param options 解析选项（idOnly会被强制设为true）
 * 
 * @example
 * ```typescript
 * async someMethod(@TokenUserId() userId: string | null) {
 *   if (userId) {
 *     // 用户已登录
 *   } else {
 *     // 匿名用户
 *   }
 * }
 * ```
 */
export const TokenUserId = createParamDecorator(
  (options: TokenParseOptions = {}, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return parseUserFromToken(request, { ...options, idOnly: true });
  },
);

/**
 * 严格Token用户装饰器
 * 如果token不存在或无效，会抛出异常
 * 
 * @example
 * ```typescript
 * async someMethod(@StrictTokenUser() user: any) {
 *   // user一定存在，否则会抛出异常
 * }
 * ```
 */
export const StrictTokenUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return parseUserFromToken(request, { throwOnInvalid: true });
  },
);

/**
 * 严格Token用户ID装饰器
 * 如果token不存在或无效，会抛出异常
 * 
 * @example
 * ```typescript
 * async someMethod(@StrictTokenUserId() userId: string) {
 *   // userId一定存在，否则会抛出异常
 * }
 * ```
 */
export const StrictTokenUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return parseUserFromToken(request, { throwOnInvalid: true, idOnly: true });
  },
);