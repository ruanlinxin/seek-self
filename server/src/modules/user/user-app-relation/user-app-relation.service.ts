import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { UserAppRelation } from './user-app-relation.entity';

@Injectable()
export class UserAppRelationService {
  constructor(
    @InjectRepository(UserAppRelation)
    private readonly relationRepo: Repository<UserAppRelation>,
  ) {}

  // 收藏
  async favorite(userId: string, appId: string): Promise<UserAppRelation> {
    let record = await this.relationRepo.findOne({ where: { userId, appId } });
    if (!record) {
      record = this.relationRepo.create({ userId, appId });
    }
    record.favoriteAt = new Date();
    return this.relationRepo.save(record);
  }

  // 取消收藏
  async unfavorite(userId: string, appId: string): Promise<UserAppRelation | undefined> {
    const record = await this.relationRepo.findOne({ where: { userId, appId } });
    if (record) {
      record.favoriteAt = null;
      return this.relationRepo.save(record);
    }
    return undefined;
  }

  // 记录最近使用
  async recordUsed(userId: string, appId: string): Promise<UserAppRelation> {
    let record = await this.relationRepo.findOne({ where: { userId, appId } });
    if (!record) {
      record = this.relationRepo.create({ userId, appId });
    }
    record.usedAt = new Date();
    return this.relationRepo.save(record);
  }
  async getRelation(userId: string): Promise<UserAppRelation[]> {
    return this.relationRepo.find({ where: { userId } });
  }

  // 获取收藏列表
  async getFavorites(userId: string): Promise<UserAppRelation[]> {
    return this.relationRepo.find({ where: { userId, favoriteAt: Not(null) }, order: { favoriteAt: 'DESC' } });
  }

  // 获取最近使用列表
  async getRecent(userId: string, limit = 10): Promise<UserAppRelation[]> {
    return this.relationRepo.find({ where: { userId, usedAt: Not(null) }, order: { usedAt: 'DESC' }, take: limit });
  }
} 