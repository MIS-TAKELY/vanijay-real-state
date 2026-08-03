import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaClient) {}

  async findFeed(opts: {
    first?: number;
    after?: string;
  } = {}): Promise<CursorPage<Property>> {
    const first = resolveFirst(opts.first);
    const after = opts.after ? decodeCursor(opts.after) : undefined;

    const rows = await this.prisma.property.findMany({
      where: {
        status: 'LIVE',
        ...(after && {
          // "strictly before" the cursor in (createdAt DESC, id DESC) order:
          // either an older instant, or the same instant with a smaller id.
          OR: [
            { createdAt: { lt: after.createdAt } },
            { createdAt: { equals: after.createdAt }, id: { lt: after.id } },
          ],
        }),
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: first + 1, // lookahead: +1 detects the next page without count()
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

  /** Any property by id (admin/owner reads; callers gate access via guards). */
  async findOne(id: string) {
    const row = await this.prisma.property.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`Property ${id} not found`);
    return PropertiesService.mapToResponse(row);
  }

  async create(input: CreatePropertyInput, ownerId: string): Promise<Property> {
    const { landArea, location, cadastralRecord, ...propertyData } = input;
    console.log("imput-->",input)
    const row = await this.prisma.property.create({
      data: {
        ...propertyData,
        ownerId,
        listingCode: await this.generateListingCode(),
        slug: this.generateSlug(input.title),
        originalAskingPrice: input.askingPrice,
        ...(landArea && { landArea: { create: landArea } }),
        ...(location && { location: { create: location } }),
        ...(cadastralRecord && { cadastralRecord: { create: cadastralRecord } }),
      },
      include: { landArea: true, location: true, cadastralRecord: true },
    });
    return PropertiesService.mapToResponse(row);
  }

  async update(input: UpdatePropertyInput): Promise<Property> {
    const { id, landArea, location, cadastralRecord, ...rest } = input;
    await this.exists(id);
    const row = await this.prisma.property.update({
      where: { id },
      data: {
        ...rest,
        ...(landArea && { landArea: { create: landArea as any } }),
        ...(location && { location: { create: location as any } }),
        ...(cadastralRecord && { cadastralRecord: { create: cadastralRecord as any } }),
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

  // ---------------------------------------------------------------- helpers

  private async exists(id: string) {
    const found = await this.prisma.property.findUnique({ where: { id } });
    if (!found) throw new NotFoundException(`Property ${id} not found`);
    return found;
  }

  /** Random-but-unique-ish listing code; Prisma's `@unique` enforces real uniqueness. */
  private async generateListingCode(): Promise<string> {
    const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `PROP-${Date.now()}-${suffix}`;
  }

  /** Slugify the title with a short random suffix for uniqueness. */
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

  /**
   * Map a raw Prisma row to the response shape. Critically converts
   * `Prisma.Decimal` -> `number` (Prisma returns Decimal for @db.Decimal columns)
   * so GraphQL `Float` and REST JSON serialize correctly. This is the single
   * boundary that prevents leaking the DB row shape to clients.
   */
  private static toNumber(value: Prisma.Decimal | number | null | undefined): number | null {
    if (value == null) return null;
    return typeof value === 'number' ? value : Number(value.toString());
  }

  private static mapToResponse(row: Prisma.PropertyGetPayload<{}>): Property {
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
      ownerId: row.ownerId,
      agentId: row.agentId ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    } as Property;
  }
}
