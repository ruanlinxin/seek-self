import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { UserContextInterceptor } from './common/interceptors/user-context.interceptor';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { JwtService } from '@nestjs/jwt';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const jwtService = app.get(JwtService);
  const port = configService.get('port');
  
  app.useGlobalInterceptors(
    new TransformInterceptor(), 
    new LoggingInterceptor(),
    new UserContextInterceptor(jwtService)
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(port);
  console.log(`应用已启动，监听端口: ${port}`);
}
bootstrap();
