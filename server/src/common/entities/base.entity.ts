import { Column, BeforeInsert,CreateDateColumn,UpdateDateColumn,DeleteDateColumn } from 'typeorm';
import { nanoid} from 'nanoid'

export abstract class BaseEntity {
  @Column({ primary: true, type: 'varchar', length: 21 })
  id: string;

  @BeforeInsert()
  async generateId() {
    if (!this.id) {
      this.id = nanoid();
    }
  }

  @Column({ type: 'varchar', length: 21, nullable: true, comment: '创建人ID' })
  createdBy: string;

  @Column({ type: 'varchar', length: 21, nullable: true, comment: '更新人ID' })
  updatedBy: string;

  @Column({ type: 'varchar', length: 21, nullable: true, comment: '删除人ID' })
  deletedBy: string;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  @DeleteDateColumn({ comment: '删除时间' })
  deletedAt: Date;
} 