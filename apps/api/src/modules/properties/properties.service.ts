import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@repo/db';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyInput } from './dto/create-property.input';
import { UpdatePropertyInput } from './dto/update-property.input';
import { Property } from './entities/property.entity';

/**
 * THE shared domain service for properties.
 *
 * Both `PropertiesController` (REST) and `PropertiesResolver` (GraphQL) inject
 * THIS service and call the same methods — business logic lives in exactly one
 * place. This is the core maintainability rule: controllers/resolvers are
 * transport adapters, the service owns the domain.
 */
@Injectable()
export class PropertiesService {
  // Cap how many rows a single list request can pull, to protect the DB.
  private static readonly DEFAULT_TAKE = 20;
  private static readonly MAX_TAKE = 100;

  constructor(private readonly prisma: PrismaService) {}

  /** Public list (only LIVE listings) with take/skip pagination. */
  findAll(opts: { take?: number; skip?: number } = {}) {
    const take = Math.min(
      opts.take ?? PropertiesService.DEFAULT_TAKE,
      PropertiesService.MAX_TAKE,
    );
    const skip = opts.skip ?? 0;

    return this.prisma.property.findMany({
      where: { status: 'LIVE' },
      take,
      skip,
      orderBy: { createdAt: 'desc' },
    }).then((rows) => rows.map(PropertiesService.mapToResponse));
  }

  /** Any property by id (admin/owner reads; callers gate access via guards). */
  async findOne(id: string) {
    const row = await this.prisma.property.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`Property ${id} not found`);
    return PropertiesService.mapToResponse(row);
  }

  /** Create a new listing. `ownerId` is injected by the transport from auth. */
  async create(input: CreatePropertyInput, ownerId: string): Promise<Property> {
    const row = await this.prisma.property.create({
      data: {
        ...input,
        ownerId,
        listingCode: await this.generateListingCode(),
        slug: this.generateSlug(input.title),
        originalAskingPrice: input.askingPrice,
      },
    });
    return PropertiesService.mapToResponse(row);
  }

  async update(input: UpdatePropertyInput): Promise<Property> {
    const { id, ...data } = input;
    await this.exists(id);
    const row = await this.prisma.property.update({
      where: { id },
      data,
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
