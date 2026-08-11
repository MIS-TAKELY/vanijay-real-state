import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PrismaClient } from '@repo/db';
import {
  CursorPage,
  decodeCursor,
  encodeCursor,
  resolveFirst,
} from 'src/common/pagination';
import { CreatePropertyInput } from './dto/create-property.input';
import { UpdatePropertyInput } from './dto/update-property.input';
import { Property } from './entities/property.entity';

const PROPERTY_SUMMARY_INCLUDE = {
  location: true,
  landArea: true,
  media: {
    orderBy: { sortOrder: 'asc' },
    select: { url: true, altText: true, sortOrder: true, isCover: true },
  },
} satisfies Prisma.PropertyInclude;

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaClient) {}

  async findFeed(
    opts: {
      first?: number;
      after?: string;
    } = {},
  ): Promise<CursorPage<Property>> {
    const first = resolveFirst(opts.first);
    const after = opts.after ? decodeCursor(opts.after) : undefined;

    const rows = await this.prisma.property.findMany({
      where: {
        status: 'LIVE',
        ...(after && {
          OR: [
            { createdAt: { lt: after.createdAt } },
            { createdAt: { equals: after.createdAt }, id: { lt: after.id } },
          ],
        }),
      },
      include: PROPERTY_SUMMARY_INCLUDE,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: first + 1,
    });

    const hasMore = rows.length > first;
    const slice = hasMore ? rows.slice(0, first) : rows;
    const last = slice[slice.length - 1];
    const nextCursor =
      hasMore && last
        ? encodeCursor({
            createdAt: new Date(last.createdAt).toISOString(),
            id: last.id,
          })
        : null;

    return {
      items: slice.map(PropertiesService.mapToResponse),
      nextCursor,
      hasMore,
    };
  }

  async findOne(idOrSlug: string): Promise<Property> {
    const row = await this.prisma.property.findFirst({
      where: {
        status: 'LIVE',
        OR: [{ slug: idOrSlug }, { id: idOrSlug }],
      },
      include: PROPERTY_SUMMARY_INCLUDE,
    });
    if (!row) throw new NotFoundException(`Property ${idOrSlug} not found`);
    return PropertiesService.mapToResponse(row);
  }

  async findByIds(ids: string[]): Promise<Property[]> {
    if (ids.length === 0) return [];
    const rows = await this.prisma.property.findMany({
      where: { id: { in: ids } },
      include: PROPERTY_SUMMARY_INCLUDE,
    });
    return rows.map(PropertiesService.mapToResponse);
  }

  async findByOwner(ownerId: string): Promise<Property[]> {
    const rows = await this.prisma.property.findMany({
      where: { ownerId },
      include: PROPERTY_SUMMARY_INCLUDE,
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    });
    return rows.map(PropertiesService.mapToResponse);
  }

  async create(input: CreatePropertyInput, ownerId: string): Promise<Property> {
    const { landArea, location, cadastralRecord, media, ...propertyData } =
      input;
    const row = await this.prisma.property.create({
      data: {
        ...propertyData,
        ownerId,
        listingCode: await this.generateListingCode(),
        slug: this.generateSlug(input.title),
        originalAskingPrice: input.askingPrice,
        ...(landArea && { landArea: { create: landArea } }),
        ...(location && { location: { create: location } }),
        ...(cadastralRecord && {
          cadastralRecord: { create: cadastralRecord },
        }),
        ...(media && media.length > 0 && {
          media: {
            create: media.map((m, index) => ({
              url: m.url,
              altText: m.altText,
              type: m.type ?? 'IMAGE',
              sortOrder: m.sortOrder ?? index,
              isCover: m.isCover ?? index === 0,
            })),
          },
        }),
      },
      include: {
        landArea: true,
        location: true,
        cadastralRecord: true,
        media: { orderBy: { sortOrder: 'asc' } },
      },
    });
    return PropertiesService.mapToResponse(row);
  }

  async update(input: UpdatePropertyInput): Promise<Property> {
    const { id, landArea, location, cadastralRecord, media, ...rest } = input;
    void media; // media replacement on update is out of scope for now
    await this.exists(id);
    const row = await this.prisma.property.update({
      where: { id },
      data: {
        ...rest,
        // Nested records are one-to-one with @unique FKs, so create would
        // violate the constraint on a second edit — upsert instead.
        ...(landArea && {
          landArea: { upsert: { create: landArea as any, update: landArea as any } },
        }),
        ...(location && {
          location: { upsert: { create: location as any, update: location as any } },
        }),
        ...(cadastralRecord && {
          cadastralRecord: {
            upsert: { create: cadastralRecord as any, update: cadastralRecord as any },
          },
        }),
      },
      include: { landArea: true, location: true, cadastralRecord: true },
    });
    return PropertiesService.mapToResponse(row);
  }

  async remove(id: string): Promise<Property> {
    await this.exists(id);
    const row = await this.prisma.property.delete({ where: { id } });
    return PropertiesService.mapToResponse(row);
  }


  private async exists(id: string) {
    const found = await this.prisma.property.findUnique({ where: { id } });
    if (!found) throw new NotFoundException(`Property ${id} not found`);
    return found;
  }

  private async generateListingCode(): Promise<string> {
    const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `PROP-${Date.now()}-${suffix}`;
  }

  private generateSlug(title: string): string {
    const base = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);
    const suffix = Math.random().toString(36).slice(2, 6);
    return `${base || 'property'}-${suffix}`;
  }

  private static toNumber(
    value: Prisma.Decimal | number | null | undefined,
  ): number | null {
    if (value == null) return null;
    return typeof value === 'number' ? value : Number(value.toString());
  }

  static mapToResponse(row: any): Property {
    return {
      id: row.id,
      listingCode: row.listingCode,
      slug: row.slug,
      title: row.title,
      description: row.description ?? undefined,
      propertyType: row.propertyType,
      status: row.status,
      verificationLevel: row.verificationLevel,
      askingPrice: PropertiesService.toNumber(row.askingPrice) as number,
      pricePerAana: PropertiesService.toNumber(row.pricePerAana),
      roadAccessWidthFt: row.roadAccessWidthFt ?? undefined,
      roadType: row.roadType ?? undefined,
      facing: row.facing ?? undefined,
      isCornerPlot: row.isCornerPlot,
      isFeatured: row.isFeatured,
      ownerId: row.ownerId,
      agentId: row.agentId ?? undefined,
      location: row.location ?? undefined,
      landArea: row.landArea ?? undefined,
      media: row.media ?? [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    } as Property;
  }
}
