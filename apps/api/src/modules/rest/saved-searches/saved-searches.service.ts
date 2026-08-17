import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PrismaClient } from '@repo/db';
import { PropertiesService, FeedFilters } from '../properties/properties.service';
import { CreateSavedSearchDto } from './dto/create-saved-search.dto';
import { UpdateSavedSearchDto } from './dto/update-saved-search.dto';

export interface SavedSearchFilters {
  q?: string | null;
  type?: string | null;
  price?: string | null;
  district?: string | null;
  minSize?: string | number | null;
  maxSize?: string | number | null;
}

const TYPE_LABELS: Record<string, string> = {
  residential: 'Residential',
  commercial: 'Commercial',
  plot: 'Plot / Land',
  house: 'House',
};

const PRICE_LABELS: Record<string, string> = {
  'under-20l': 'Under 20L',
  '20l-50l': '20L – 50L',
  '50l-1cr': '50L – 1Cr',
  '1cr-plus': '1Cr+',
};

@Injectable()
export class SavedSearchesService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly properties: PropertiesService,
  ) {}

  /** The current user's saved searches, most recently created first. */
  async list(userId: string) {
    const rows = await this.prisma.savedSearch.findMany({
      where: { userId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
    return Promise.all(
      rows.map((row) => this.toResponse(row, row.filters as SavedSearchFilters)),
    );
  }

  async create(userId: string, dto: CreateSavedSearchDto) {
    const filters = dto.filters as SavedSearchFilters;
    const row = await this.prisma.savedSearch.create({
      data: {
        userId,
        label: dto.label?.trim() || this.buildLabel(filters),
        filters: (filters ?? {}) as Prisma.InputJsonValue,
        alertFrequency: dto.alertFrequency ?? 'INSTANT',
      },
    });
    return this.toResponse(row, filters);
  }

  async update(userId: string, id: string, dto: UpdateSavedSearchDto) {
    const row = await this.findOwned(userId, id);
    const updated = await this.prisma.savedSearch.update({
      where: { id: row.id },
      data: {
        ...(dto.label !== undefined
          ? { label: dto.label.trim() || row.label }
          : {}),
        ...(dto.alertFrequency !== undefined
          ? { alertFrequency: dto.alertFrequency }
          : {}),
      },
    });
    return this.toResponse(
      updated,
      updated.filters as SavedSearchFilters,
    );
  }

  async remove(userId: string, id: string) {
    const row = await this.findOwned(userId, id);
    await this.prisma.savedSearch.delete({ where: { id: row.id } });
    return { removed: true };
  }

  /** Builds a human-readable label from the filter state. */
  private buildLabel(filters: SavedSearchFilters): string {
    const parts: string[] = [];
    if (filters.q?.trim()) parts.push(`“${filters.q.trim()}”`);
    if (filters.district?.trim()) parts.push(filters.district.trim());
    const type = filters.type;
    if (type && type !== 'all' && type !== 'any') {
      parts.push(TYPE_LABELS[type] ?? type);
    }
    const price = filters.price;
    if (price && price !== 'any') {
      parts.push(PRICE_LABELS[price] ?? price);
    }
    if (filters.minSize || filters.maxSize) {
      parts.push(
        `${filters.minSize ?? '0'}–${filters.maxSize ?? '∞'} sqft`,
      );
    }
    return parts.length > 0 ? parts.join(', ') : 'Saved search';
  }

  private async findOwned(userId: string, id: string) {
    const row = await this.prisma.savedSearch.findFirst({
      where: { id, userId },
    });
    if (!row) throw new NotFoundException('Saved search not found');
    return row;
  }

  private async toResponse(
    row: {
      id: string;
      label: string;
      filters: unknown;
      alertFrequency: string;
      createdAt: Date;
      updatedAt: Date;
    },
    filters: SavedSearchFilters,
  ) {
    const matchCount = await this.properties.countMatches(
      this.toFeedFilters(filters),
    );
    return {
      id: row.id,
      label: row.label,
      filters: filters ?? {},
      alertFrequency: row.alertFrequency,
      matchCount,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private toFeedFilters(filters: SavedSearchFilters): FeedFilters {
    return {
      q: filters.q ?? undefined,
      type: filters.type ?? undefined,
      price: filters.price ?? undefined,
      district: filters.district ?? undefined,
      minSize:
        filters.minSize != null && filters.minSize !== ''
          ? Number(filters.minSize)
          : undefined,
      maxSize:
        filters.maxSize != null && filters.maxSize !== ''
          ? Number(filters.maxSize)
          : undefined,
    };
  }
}
