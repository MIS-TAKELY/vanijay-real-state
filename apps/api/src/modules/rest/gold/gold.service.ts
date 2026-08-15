import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@repo/db';

export interface MetalConfigDto {
  slug: string; name: string; symbol?: string; isEnabled?: boolean;
  description?: string; accentColor?: string; seoTitle?: string; seoDescription?: string;
}

export interface MetalFaqDto { question: string; answer: string; sortOrder?: number; id?: string; }
export interface PriceOverrideDto { metalSlug: string; ask?: number; bid?: number; unit?: string; currency?: string; note?: string; active?: boolean; }

@Injectable()
export class GoldService {
  constructor(private readonly prisma: PrismaClient) {}

  async listMetals(includeDisabled = true) {
    return this.prisma.metalConfig.findMany({
      where: includeDisabled ? {} : { isEnabled: true },
      orderBy: { slug: 'asc' },
      include: { faqs: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async getMetal(slug: string) {
    return this.prisma.metalConfig.findUnique({
      where: { slug },
      include: { faqs: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async upsertMetal(actorId: string, dto: MetalConfigDto) {
    const metal = await this.prisma.metalConfig.upsert({
      where: { slug: dto.slug },
      create: dto,
      update: dto,
    });
    await this.audit(actorId, 'upsert', 'metal_config', metal.id, `Upserted metal '${dto.slug}'`);
    return metal;
  }

  async setMetalEnabled(actorId: string, slug: string, isEnabled: boolean) {
    const metal = await this.prisma.metalConfig.update({ where: { slug }, data: { isEnabled } });
    await this.audit(actorId, isEnabled ? 'enable' : 'disable', 'metal_config', metal.id, `${isEnabled ? 'Enabled' : 'Disabled'} metal '${slug}'`);
    return metal;
  }

  async setFaqs(actorId: string, slug: string, faqs: MetalFaqDto[]) {
    return this.prisma.$transaction(async (tx) => {
      const metal = await tx.metalConfig.findUniqueOrThrow({ where: { slug } });
      await tx.metalFaq.deleteMany({ where: { metalId: metal.id } });
      for (let i = 0; i < faqs.length; i++) {
        await tx.metalFaq.create({ data: { metalId: metal.id, question: faqs[i].question, answer: faqs[i].answer, sortOrder: faqs[i].sortOrder ?? i } });
      }
      return tx.metalFaq.findMany({ where: { metalId: metal.id }, orderBy: { sortOrder: 'asc' } });
    });
  }

  async getActiveOverride(metalSlug: string) {
    return this.prisma.goldPriceOverride.findFirst({ where: { metalSlug, active: true }, orderBy: { createdAt: 'desc' } });
  }

  async listOverrides() {
    return this.prisma.goldPriceOverride.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async setOverride(actorId: string, dto: PriceOverrideDto) {
    // Deactivate any prior active override for this metal, then create the new one.
    await this.prisma.goldPriceOverride.updateMany({ where: { metalSlug: dto.metalSlug, active: true }, data: { active: false } });
    const override = await this.prisma.goldPriceOverride.create({
      data: { metalSlug: dto.metalSlug, ask: dto.ask as any, bid: dto.bid as any, unit: dto.unit ?? 'oz', currency: dto.currency ?? 'NPR', note: dto.note, active: dto.active ?? true, setById: actorId },
    });
    await this.audit(actorId, 'price_override', 'gold_price_override', override.id, `Set ${dto.currency} ${dto.ask}/${dto.bid} for ${dto.metalSlug}`);
    return override;
  }

  async clearOverride(actorId: string, id: string) {
    const o = await this.prisma.goldPriceOverride.update({ where: { id }, data: { active: false } });
    await this.audit(actorId, 'clear_override', 'gold_price_override', id, `Cleared override for ${o.metalSlug}`);
    return o;
  }

  private async audit(actorId: string, action: string, entity: string, entityId: string | null | undefined, summary: string) {
    if (!actorId) return;
    try {
      await this.prisma.adminAuditLog.create({ data: { actorId, action, entity, entityId: entityId ?? undefined, summary } });
    } catch { /* no-op */ }
  }
}
