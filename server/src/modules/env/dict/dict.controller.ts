import { Controller, Post, Get, Patch, Delete, Param, Body } from '@nestjs/common';
import { DictService } from './dict.service';

@Controller('env/dict')
export class DictController {
  constructor(private readonly dictService: DictService) {}

  @Post()
  async create(@Body() body) {
    return this.dictService.create(body);
  }

  @Get()
  async findAll() {
    return this.dictService.findAll();
  }

  @Get('enabled')
  async findAllEnabled() {
    return this.dictService.findAllEnabled();
  }

  @Get('type/:type')
  async findByType(@Param('type') type: string) {
    return this.dictService.findByType(type);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.dictService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body) {
    return this.dictService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.dictService.remove(id);
  }
} 