import { ConfigService } from '@nestjs/config';

export const getJwtConfig = (configService: ConfigService) => ({
  secret: configService.get('jwt.secret'),
  expiresIn: configService.get('jwt.expiresIn'),
}); 