import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('bing_images')
@Index('IDX_bing_images_date_region', ['date', 'region'])
export class BingImage extends BaseEntity {

  @Column({ type: 'date' })
  date: string;

  @Column({ length: 500 })
  title: string;

  @Column({ length: 1000 })
  url: string;

  @Column({ length: 1000 })
  fullUrl: string;

  @Column({ length: 500, nullable: true })
  copyright: string;

  @Column({ length: 100, nullable: true })
  region: string;

  @Column({ type: 'text', nullable: true })
  description: string;
}
