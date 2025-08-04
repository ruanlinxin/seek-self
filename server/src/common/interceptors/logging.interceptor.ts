import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const now = Date.now();

    console.log(`[请求] ${method} ${url}`);
    console.log('[请求体]', body);

    return next.handle().pipe(
      tap({
        next: (data) => {
          console.log(`[响应] ${method} ${url} ${Date.now() - now}ms`);
          console.log('[响应体]', data);
        },
        error: (error) => {
          console.error(`[错误] ${method} ${url} ${Date.now() - now}ms`);
          console.error('[错误信息]', error);
        },
      }),
    );
  }
} 