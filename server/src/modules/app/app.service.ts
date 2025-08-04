import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { App } from './app.entity';
import { isAdmin } from '@/common/tools';
import { UserAppRelationService } from '../user/user-app-relation/user-app-relation.service';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(App)
    private readonly appRepo: Repository<App>,
    private readonly userAppRelationService: UserAppRelationService,  
  ) {}

  async create(data: Partial<App>) {
    const app = this.appRepo.create(data);
    await this.appRepo.save(app);
    return app;
  }

  async findAll() {
    return this.appRepo.find();
  }

  async findEnabledApps(isAdmin: boolean = false) {
    const query = this.appRepo.createQueryBuilder('app')
      .where('app.status = :status', { status: 1 });
    
    if (!isAdmin) {
      query.andWhere('app.isSystem = :isSystem', { isSystem: false });
    }
    
    return query.getMany();
  }

  async findOne(id: string) {
    const app = await this.appRepo.findOne({ where: { id } });
    if (!app) throw new NotFoundException('应用不存在');
    return app;
  }

  async update(id: string, data: Partial<App>) {
    const app = await this.findOne(id);
    Object.assign(app, data);
    await this.appRepo.save(app);
    return app;
  }

  async remove(id: string) {
    const app = await this.findOne(id);
    await this.appRepo.softRemove(app);
    return { message: '删除成功' };
  }

  async getApp(userId?: string) {
    const rerlationList = userId ? await this.userAppRelationService.getRelation(userId) : [];
    const mrerlationMap = rerlationList.reduce((acc,item)=>{
      acc[item.appId] = item;
      return acc;
    },{});
    const query = this.appRepo.createQueryBuilder('app')
      .where('app.status = :status', { status: 1 });
    if (!isAdmin(userId)) {
      query.andWhere('app.isSystem = :isSystem', { isSystem: false });
    }
    const apps = await query.getMany();
    return apps.map(app=>{
      return {
        ...app,
        favoriteAt:mrerlationMap[app.id]?.favoriteAt||null,
        usedAt:mrerlationMap[app.id]?.usedAt||null,
      }
    })
  }
} 