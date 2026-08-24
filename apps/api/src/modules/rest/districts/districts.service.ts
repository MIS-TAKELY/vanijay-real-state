import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@repo/db';

export interface DistrictMetaDto {
  slug: string;
  name: string;
  province: string;
  topography?: 'VALLEY' | 'TERAI' | 'HILL' | 'MOUNTAIN';
  tier?: 'CADASTRAL' | 'FIELD' | 'PENDING';
  avgRatePerAana?: number | null;
  trendPct?: number | null;
  description?: string | null;
}

@Injectable()
export class DistrictsService {
  constructor(private readonly prisma: PrismaClient) {}

  list() {
    return this.prisma.districtMeta.findMany({
      orderBy: [{ province: 'asc' }, { name: 'asc' }],
    });
  }

  async getBySlug(slug: string) {
    const district = await this.prisma.districtMeta.findUnique({
      where: { slug },
    });
    if (!district) throw new NotFoundException(`Unknown district '${slug}'`);
    return district;
  }

  /** Slug is the stable identity — POST creates or updates in one call. */
  async upsert(actorId: string, dto: DistrictMetaDto) {
    if (!dto.slug?.trim()) {
      throw new NotFoundException('District slug is required');
    }
    const slug = dto.slug.trim().toLowerCase().replace(/\s+/g, '-');
    const data = {
      slug,
      name: dto.name,
      province: dto.province,
      topography: dto.topography ?? undefined,
      tier: dto.tier ?? undefined,
      avgRatePerAana: dto.avgRatePerAana ?? undefined,
      trendPct: dto.trendPct ?? undefined,
      description: dto.description ?? undefined,
      updatedById: actorId || undefined,
    };
    const district = await this.prisma.districtMeta.upsert({
      where: { slug },
      create: data,
      update: { ...data, slug },
    });
    await this.audit(
      actorId,
      'upsert',
      'district_meta',
      district.id,
      `Upserted district '${slug}'`,
    );
    return district;
  }

  async remove(actorId: string, slug: string) {
    const existing = await this.prisma.districtMeta.findUnique({
      where: { slug },
    });
    if (!existing) throw new NotFoundException(`Unknown district '${slug}'`);
    await this.prisma.districtMeta.delete({ where: { slug } });
    await this.audit(
      actorId,
      'delete',
      'district_meta',
      existing.id,
      `Deleted district '${slug}'`,
    );
    return { deleted: true, slug };
  }

  private async audit(
    actorId: string,
    action: string,
    entity: string,
    entityId: string | null | undefined,
    summary: string,
  ) {
    if (!actorId) return;
    try {
      await this.prisma.adminAuditLog.create({
        data: {
          actorId,
          action,
          entity,
          entityId: entityId ?? undefined,
          summary,
        },
      });
    } catch {
      // Audit logging must never break the primary operation.
    }
  }
}
