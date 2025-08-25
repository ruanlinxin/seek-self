import { createParamDecorator, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

/**
 * 获取当前已认证的用户信息（需要JWT守卫）
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

/**
 * 获取当前已认证的用户ID（需要JWT守卫）
 */
export const CurrentUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.id;
  },
);

/**
 * 可选用户信息装饰器选项
 */
export interface OptionalUserOptions {
  /** 是否在token无效时抛出异常，默认false */
  throwOnInvalid?: boolean;
  /** 默认用户信息，当token不存在或无效时返回 */
  defaultUser?: any;
}

/**
 * JWT Token解析服务
 */
@Injectable()
export class JwtTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 从请求中解析JWT token
   */
  parseTokenFromRequest(request: any): any | null {
    // 首先检查是否已通过JWT守卫认证
    if (request.user) {
      return request.user;
    }

    // 尝试从Authorization头解析token
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    try {
      const token = authHeader.substring(7);
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('jwt.secret'),
      });
      
      // 返回与JwtStrategy.validate相同格式的用户信息
      return {
        id: payload.id,
        username: payload.username,
      };
    } catch (error) {
      // JWT验证失败
      return null;
    }
  }
}

/**
 * 可选用户信息装饰器 - 支持无JWT守卫的场景
 * 会尝试解析JWT token，如果失败则返回null或默认值
 */
export const OptionalUser = createParamDecorator(
  (options: OptionalUserOptions = {}, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    
    // 获取JwtTokenService实例（需要在模块中注册）
    const app = ctx.getArgByIndex(2); // 获取应用实例
    let jwtTokenService: JwtTokenService;
    
    try {
      jwtTokenService = app?.get?.(JwtTokenService);
    } catch (error) {
      // 如果无法获取服务，手动解析
      return parseTokenManually(request, options);
    }

    if (!jwtTokenService) {
      return parseTokenManually(request, options);
    }

    try {
      const user = jwtTokenService.parseTokenFromRequest(request);
      return user || options.defaultUser || null;
    } catch (error) {
      if (options.throwOnInvalid) {
        throw error;
      }
      return options.defaultUser || null;
    }
  },
);

/**
 * 可选用户ID装饰器
 */
export const OptionalUserId = createParamDecorator(
  (options: OptionalUserOptions = {}, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    
    // 首先检查是否已通过JWT守卫认证
    if (request.user?.id) {
      return request.user.id;
    }

    // 尝试手动解析
    const user = parseTokenManually(request, options);
    return user?.id || options.defaultUser || null;
  },
);

/**
 * 手动解析JWT token的辅助函数
 */
function parseTokenManually(request: any, options: OptionalUserOptions): any | null {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return options.defaultUser || null;
  }

  try {
    const token = authHeader.substring(7);
    
    // 简单的JWT解码（不验证签名，仅用于获取payload）
    const parts = token.split('.');
    if (parts.length !== 3) {
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

    return {
      id: payload.id,
      username: payload.username,
    };
  } catch (error) {
    if (options.throwOnInvalid) {
      throw error;
    }
    return options.defaultUser || null;
  }
} 