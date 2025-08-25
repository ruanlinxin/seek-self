import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtTokenService } from '@/common/decorators/user.decorator';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: { expiresIn: configService.get('jwt.expiresIn') || '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [JwtStrategy, JwtTokenService],
  exports: [JwtModule, JwtTokenService],
})
export class AuthModule {} 