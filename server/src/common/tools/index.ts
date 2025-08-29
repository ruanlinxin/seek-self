import { Repository } from 'typeorm';


export async function softDeleteById<T>(repo: Repository<T>, id: any) {
  const entity = await repo.findOne({ where: { id } as any });
  if (!entity) throw new Error('数据不存在');
  await repo.softRemove(entity);
  return { message: '删除成功' };
} 