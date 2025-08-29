import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
  ) {}

  async create(userId: string, remark?: string) {
    const existingAdmin = await this.adminRepo.findOne({ where: { userId } });
    if (existingAdmin) {
      throw new Error('该用户已经是管理员');
    }

    const admin = this.adminRepo.create({
      userId,
      remark,
      isActive: true,
    });
    return this.adminRepo.save(admin);
  }

  async findAll() {
    return this.adminRepo.find({
      where: { isActive: true },
    });
  }

  async isAdmin(userId: string): Promise<boolean> {
    const admin = await this.adminRepo.findOne({
      where: { userId, isActive: true },
    });
    return !!admin;
  }

  async remove(userId: string) {
    const admin = await this.adminRepo.findOne({ where: { userId } });
    if (!admin) {
      throw new Error('管理员不存在');
    }
    admin.isActive = false;
    return this.adminRepo.save(admin);
  }

  async activate(userId: string) {
    const admin = await this.adminRepo.findOne({ where: { userId } });
    if (!admin) {
      throw new Error('管理员不存在');
    }
    admin.isActive = true;
    return this.adminRepo.save(admin);
  }
}