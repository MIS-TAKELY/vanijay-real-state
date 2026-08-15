import { Injectable } from '@nestjs/common';
import { KabadiUnit, PrismaClient } from '@repo/db';

export interface CategoryDto {
  slug: string; name: string; nepali?: string; icon?: string; blurb?: string; sortOrder?: number; published?: boolean;
}
export interface ItemDto {
  categoryId: string; name: string; nepali?: string; unit?: KabadiUnit; rate: number; note?: string; popular?: boolean; sortOrder?: number; published?: boolean; id?: string;
}
export interface SetRatesDto { items: ItemDto[]; }

@Injectable()
export class KabadiService {
  constructor(private readonly prisma: PrismaClient) {}

  async listCategories(includeUnpublished = false) {
    return this.prisma.kabadiCategory.findMany({
      where: includeUnpublished ? {} : { published: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        items: { where: includeUnpublished ? {} : { published: true }, orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  async upsertCategory(actorId: string, dto: CategoryDto) {
    const cat = await this.prisma.kabadiCategory.upsert({
      where: { slug: dto.slug }, create: dto, update: dto,
    });
    await this.audit(actorId, 'upsert', 'kabadi_category', cat.id, `Upserted kabadi category '${dto.slug}'`);
    return cat;
  }

  async setCategoryPublished(actorId: string, id: string, published: boolean) {
    const cat = await this.prisma.kabadiCategory.update({ where: { id }, data: { published } });
    await this.audit(actorId, published ? 'publish' : 'unpublish', 'kabadi_category', id, `${published ? 'Published' : 'Unpublished'} category '${cat.name}'`);
    return cat;
  }

  async upsertItem(actorId: string, dto: ItemDto) {
    const item = dto.id
      ? await this.prisma.kabadiItem.update({ where: { id: dto.id }, data: { ...dto, rate: dto.rate as any } })
      : await this.prisma.kabadiItem.create({ data: { ...dto, rate: dto.rate as any } });
    await this.audit(actorId, dto.id ? 'update' : 'create', 'kabadi_item', item.id, `Saved rate '${item.name}'`);
    return item;
  }

  /** Update many rates at once (bulk edit by category or the whole catalog). */
  async setRates(actorId: string, dto: SetRatesDto) {
    const result = await this.prisma.$transaction(
      dto.items.map((i) =>
        i.id
          ? this.prisma.kabadiItem.update({ where: { id: i.id }, data: { ...i, rate: i.rate as any } })
          : this.prisma.kabadiItem.create({ data: { ...i, rate: i.rate as any } }),
      ),
    );
    await this.audit(actorId, 'bulk_update', 'kabadi_item', null, `Bulk-updated ${dto.items.length} rates`);
    return result;
  }

  async removeItem(actorId: string, id: string) {
    const item = await this.prisma.kabadiItem.delete({ where: { id } });
    await this.audit(actorId, 'delete', 'kabadi_item', id, `Deleted rate '${item.name}'`);
    return { deleted: true, id };
  }

  async setItemPublished(actorId: string, id: string, published: boolean) {
    const item = await this.prisma.kabadiItem.update({ where: { id }, data: { published } });
    await this.audit(actorId, published ? 'publish' : 'unpublish', 'kabadi_item', id, `${published ? 'Published' : 'Unpublished'} rate '${item.name}'`);
    return item;
  }

  private async audit(actorId: string, action: string, entity: string, entityId: string | null | undefined, summary: string) {
    if (!actorId) return;
    try {
      await this.prisma.adminAuditLog.create({ data: { actorId, action, entity, entityId: entityId ?? undefined, summary } });
    } catch { /* no-op */ }
  }
}
