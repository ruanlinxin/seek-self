import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './user.dto';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { customAlphabet } from 'nanoid';
import { UserProfile } from './user-profile.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    @InjectRepository(UserProfile)
    private readonly userProfileRepo: Repository<UserProfile>,
  ) {}

  async register(dto: CreateUserDto) {
    const exist = await this.userRepo.findOne({ where: { username: dto.username } });
    if (exist) throw new BadRequestException('用户名已存在');
    const randomNickname = '用户_' + customAlphabet('1234567890abcdef', 8)();
    const user = this.userRepo.create({
      ...dto,
      password: await bcrypt.hash(dto.password, 10),
    });
    await this.userRepo.save(user);
    const profile = this.userProfileRepo.create({ userId: user.id, nickname: randomNickname });
    await this.userProfileRepo.save(profile);
    return { message: '注册成功' };
  }

  async login(dto: LoginUserDto) {
    const user = await this.userRepo.findOne({ where: { username: dto.username } });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    const payload = { id: user.id, username: user.username };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('用户不存在');
    const profile = await this.userProfileRepo.findOne({ where: { userId } });
    const { password, ...userResult } = user;
    return { ...userResult, profile };
  }

  async updateProfile(userId: string, body: Partial<UserProfile>) {
    const profile = await this.userProfileRepo.findOne({ where: { userId } });
    if (!profile) throw new BadRequestException('用户信息不存在');
    Object.assign(profile, body);
    await this.userProfileRepo.save(profile);
    return { message: '修改成功' };
  }
} 