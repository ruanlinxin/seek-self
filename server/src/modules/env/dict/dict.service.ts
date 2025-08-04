import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dict } from '@/modules/env/dict/dict.entity';
import { softDeleteById } from '@/common/tools';

@Injectable()
export class DictService {
  constructor(
    @InjectRepository(Dict)
    private readonly dictRepo: Repository<Dict>,
  ) {}

  async create(data: Partial<Dict>) {
    const exist = await this.dictRepo.findOne({ where: { key: data.key } });
    if (exist) throw new BadRequestException('字典键已存在');
    const dict = this.dictRepo.create(data);
    await this.dictRepo.save(dict);
    return dict;
  }

  async findAll() {
    return this.dictRepo.find();
  }

  async findAllEnabled() {
    return this.dictRepo.find({ where: { enabled: true }, order: { type: 'ASC', key: 'ASC' } });
  }

  async findOne(id: string) {
    const dict = await this.dictRepo.findOne({ where: { id } });
    if (!dict) throw new NotFoundException('字典项不存在');
    return dict;
  }

  async update(id: string, data: Partial<Dict>) {
    const dict = await this.findOne(id);
    Object.assign(dict, data);
    await this.dictRepo.save(dict);
    return dict;
  }

  async remove(id: string) {
    return softDeleteById(this.dictRepo, id);
  }

  async findByType(type: string) {
    return this.dictRepo.find({ where: { type }, order: { key: 'ASC' } });
  }
} 