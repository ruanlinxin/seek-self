import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class UserContextInterceptor implements NestInterceptor {
  constructor(private readonly jwtService: JwtService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // 尝试从请求头获取 token
    const token = this.extractTokenFromHeader(request);
    
    if (token) {
      try {
        // 验证并解析 token
        const payload = await this.jwtService.verifyAsync(token);
        
        // 将用户信息注入到 request.user
        request.user = {
          id: payload.sub,
          username: payload.username,
          ...payload,
        };
      } catch (error) {
        // token 无效时不抛出异常，只是不设置 user 信息
        // 这样可以让接口自己决定是否需要登录
        console.log('Token verification failed:', error.message);
      }
    }

    return next.handle();
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
} 