import { IsString, Length, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: '用户名必须为字符串' })
  @Length(4, 20, { message: '用户名长度需在4-20位' })
  username: string;

  @IsString({ message: '密码必须为字符串' })
  @Length(6, 32, { message: '密码长度需在6-32位' })
  password: string;
}

export class LoginUserDto {
  @IsString({ message: '用户名必须为字符串' })
  username: string;

  @IsString({ message: '密码必须为字符串' })
  password: string;
} 