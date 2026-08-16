import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PrismaClient, PropertyType } from '@repo/db';
import {
  CursorPage,
  decodeCursor,
  encodeCursor,
  resolveFirst,
} from 'src/common/pagination';
import { CreatePropertyInput } from './dto/create-property.input';
import { UpdatePropertyInput } from './dto/update-property.input';
import { Property } from './entities/property.entity';
import { SearchSuggestion } from './entities/search-suggestion.entity';

export interface FeedFilters {
  q?: string;
  type?: string;
  price?: string;
  district?: string;
  minSize?: number;
  maxSize?: number;
}

const TYPE_GROUPS: Record<string, PropertyType[]> = {
  residential: ['RESIDENTIAL_LAND', 'RESIDENTIAL_HOUSE'],
  commercial: ['COMMERCIAL_LAND', 'COMMERCIAL_SPACE'],
  plot: ['RESIDENTIAL_LAND', 'COMMERCIAL_LAND', 'AGRICULTURAL_LAND'],
  house: ['RESIDENTIAL_HOUSE', 'HERITAGE_HOME'],
  land: ['RESIDENTIAL_LAND', 'COMMERCIAL_LAND', 'AGRICULTURAL_LAND'],
};

const PRICE_BANDS: Record<string, { gte?: number; lt?: number }> = {
  'under-20l': { lt: 2_000_000 },
  '20l-50l': { gte: 2_000_000, lt: 5_000_000 },
  '50l-1cr': { gte: 5_000_000, lt: 10_000_000 },
  '1cr-plus': { gte: 10_000_000 },
};

const PROPERTY_SUMMARY_INCLUDE = {
  location: true,
  landArea: true,
  media: {
    orderBy: { sortOrder: 'asc' },
    select: {
      type: true,
      url: true,
      altText: true,
      sortOrder: true,
      isCover: true,
    },
  },
} satisfies Prisma.PropertyInclude;

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaClient) {}

  async findFeed(
    opts: {
      first?: number;
      after?: string;
    } & FeedFilters = {},
  ): Promise<CursorPage<Property>> {
    const first = resolveFirst(opts.first);
    const after = opts.after ? decodeCursor(opts.after) : undefined;

    const rows = await this.prisma.property.findMany({
      where: {
        status: 'LIVE',
        AND: [
          ...(after
            ? [
                {
                  OR: [
                    { createdAt: { lt: after.createdAt } },
                    {
                      createdAt: { equals: after.createdAt },
                      id: { lt: after.id },
                    },
                  ],
                } as Prisma.PropertyWhereInput,
              ]
            : []),
          this.buildFilterWhere(opts),
        ],
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

  async suggestLocations(q: string, limit = 8): Promise<SearchSuggestion[]> {
    const needle = q.trim();
    if (!needle) return [];

    const like = { contains: needle, mode: 'insensitive' } as const;
    const rows = await this.prisma.propertyLocation.findMany({
      where: {
        property: { status: 'LIVE' },
        OR: [{ district: like }, { municipality: like }, { areaName: like }],
      },
      select: { district: true, municipality: true, areaName: true },
      take: 200,
    });

    const needleLower = needle.toLowerCase();
    const seen = new Set<string>();
    const candidates: Array<SearchSuggestion & { rank: number }> = [];

    const push = (value: string, type: string) => {
      const clean = value.trim();
      if (!clean) return;
      const key = `${type}:${clean.toLowerCase()}`;
      if (seen.has(key)) return;
      seen.add(key);
      const lower = clean.toLowerCase();
      const rank =
        lower === needleLower ? 0 : lower.startsWith(needleLower) ? 1 : 2;
      candidates.push({ value: clean, label: clean, type, rank });
    };

    for (const row of rows) {
      if (row.areaName?.toLowerCase().includes(needleLower)) {
        push(row.areaName, 'AREA');
      }
      if (row.municipality?.toLowerCase().includes(needleLower)) {
        push(row.municipality, 'MUNICIPALITY');
      }
      if (row.district?.toLowerCase().includes(needleLower)) {
        push(row.district, 'DISTRICT');
      }
    }

    return candidates
      .sort((a, b) => a.rank - b.rank || a.value.localeCompare(b.value))
      .slice(0, limit)
      .map(({ value, label, type }) => ({ value, label, type }));
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
    const {
      landArea,
      location,
      cadastralRecord,
      media,
      documents,
      ...propertyData
    } = input;
    const row = await this.prisma.property.create({
      data: {
        ...propertyData,
        ownerId,
        // Seller submissions are published immediately — visible on the public
        // feed/landing pages but flagged UNVERIFIED until the verification team
        // reviews the ownership documents and raises verificationLevel.
        status: 'LIVE',
        verificationLevel: 'UNVERIFIED',
        publishedAt: new Date(),
        listingCode: await this.generateListingCode(),
        slug: this.generateSlug(input.title),
        originalAskingPrice: input.askingPrice,
        ...(landArea && { landArea: { create: landArea } }),
        ...(location && { location: { create: location } }),
        ...(cadastralRecord && {
          cadastralRecord: { create: cadastralRecord },
        }),
        ...(media &&
          media.length > 0 && {
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
        ...(documents &&
          documents.length > 0 && {
            documents: {
              create: documents.map((d) => ({
                type: d.type,
                fileUrl: d.fileUrl,
                fileName: d.fileName,
                fileSizeMb: d.fileSizeMb,
                isPrivate: d.isPrivate ?? true,
                status: 'PENDING',
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
    const {
      id,
      landArea,
      location,
      cadastralRecord,
      media,
      documents,
      ...rest
    } = input;
    await this.exists(id);
    // Content edits (title, price, location, media, …) invalidate the previous
    // verification — drop the listing back to UNVERIFIED until the team
    // re-reviews it. Status-only PATCHes (Mark sold / Archive) keep the level.
    const contentEdited =
      Object.keys(rest).some((key) => key !== 'status') ||
      landArea !== undefined ||
      location !== undefined ||
      cadastralRecord !== undefined ||
      media !== undefined ||
      documents !== undefined;
    const row = await this.prisma.property.update({
      where: { id },
      data: {
        ...rest,
        ...(contentEdited ? { verificationLevel: 'UNVERIFIED' } : {}),
        // Nested records are one-to-one with @unique FKs, so create would
        // violate the constraint on a second edit — upsert instead.
        ...(landArea && {
          landArea: {
            upsert: { create: landArea as any, update: landArea as any },
          },
        }),
        ...(location && {
          location: {
            upsert: { create: location as any, update: location as any },
          },
        }),
        ...(cadastralRecord && {
          cadastralRecord: {
            upsert: {
              create: cadastralRecord as any,
              update: cadastralRecord as any,
            },
          },
        }),
        // Media is replaced wholesale when provided (even an empty array,
        // which clears the gallery). `undefined` leaves the gallery untouched.
        ...(media !== undefined && {
          media: {
            deleteMany: {},
            create: media.map((m, index) => ({
              url: m.url,
              altText: m.altText,
              type: m.type ?? 'IMAGE',
              sortOrder: m.sortOrder ?? index,
              isCover: m.isCover ?? index === 0,
            })),
          },
        }),
        // Documents are replaced wholesale when provided, same as media.
        ...(documents !== undefined && {
          documents: {
            deleteMany: {},
            create: documents.map((d) => ({
              type: d.type,
              fileUrl: d.fileUrl,
              fileName: d.fileName,
              fileSizeMb: d.fileSizeMb,
              isPrivate: d.isPrivate ?? true,
              status: 'PENDING',
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

  /** Builds the Prisma WHERE clause for the public search/filter controls
   *  (keyword, type, price band, district, and land size). */
  private buildFilterWhere(opts: FeedFilters): Prisma.PropertyWhereInput {
    const { q, type, price, district, minSize, maxSize } = opts;
    const filters: Prisma.PropertyWhereInput[] = [];

    if (q && q.trim()) {
      // Split into tokens so "kathmandu land" matches listings whose title,
      // description, code, or location contain all of the tokens.
      const tokens = q
        .trim()
        .split(/\s+/)
        .map((t) => t.toLowerCase())
        .filter(Boolean);
      if (tokens.length > 0) {
        filters.push({
          AND: tokens.map((token) => ({
            OR: [
              { title: { contains: token, mode: 'insensitive' } },
              { description: { contains: token, mode: 'insensitive' } },
              { listingCode: { contains: token, mode: 'insensitive' } },
              {
                location: {
                  is: { district: { contains: token, mode: 'insensitive' } },
                },
              },
              {
                location: {
                  is: {
                    municipality: { contains: token, mode: 'insensitive' },
                  },
                },
              },
              {
                location: {
                  is: { areaName: { contains: token, mode: 'insensitive' } },
                },
              },
              {
                location: {
                  is: { addressText: { contains: token, mode: 'insensitive' } },
                },
              },
            ],
          })),
        });
      }
    }

    if (type && type !== 'all') {
      const types =
        TYPE_GROUPS[type] ??
        ((Object.values(PropertyType) as string[]).includes(type)
          ? [type as PropertyType]
          : undefined);
      if (types?.length) {
        filters.push({ propertyType: { in: types } });
      }
    }

    if (price && price !== 'any') {
      const band = PRICE_BANDS[price];
      if (band) {
        filters.push({
          askingPrice: {
            ...(band.gte != null ? { gte: band.gte } : {}),
            ...(band.lt != null ? { lt: band.lt } : {}),
          },
        });
      }
    }

    if (district && district.trim()) {
      filters.push({
        location: {
          is: { district: { contains: district.trim(), mode: 'insensitive' } },
        },
      });
    }

    if (minSize != null || maxSize != null) {
      filters.push({
        landArea: {
          is: {
            totalSqFt: {
              ...(minSize != null ? { gte: minSize } : {}),
              ...(maxSize != null ? { lte: maxSize } : {}),
            },
          },
        },
      });
    }

    return filters.length > 0 ? { AND: filters } : {};
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
      isNegotiable: row.isNegotiable ?? false,
      minBuyableLandSqFt: row.minBuyableLandSqFt ?? undefined,
      minBuyableUnitSystem: row.minBuyableUnitSystem ?? undefined,
      minBuyableRopani: row.minBuyableRopani ?? undefined,
      minBuyableAana: row.minBuyableAana ?? undefined,
      minBuyablePaisa: row.minBuyablePaisa ?? undefined,
      minBuyableDaam: row.minBuyableDaam ?? undefined,
      minBuyableBigha: row.minBuyableBigha ?? undefined,
      minBuyableKatha: row.minBuyableKatha ?? undefined,
      minBuyableDhur: row.minBuyableDhur ?? undefined,
      // Type-specific Step 3 specs
      builtUpAreaSqFt: row.builtUpAreaSqFt ?? undefined,
      propertySubtype: row.propertySubtype ?? undefined,
      yearBuilt: row.yearBuilt ?? undefined,
      constructionStatus: row.constructionStatus ?? undefined,
      floorNumber: row.floorNumber ?? undefined,
      totalFloors: row.totalFloors ?? undefined,
      bedrooms: row.bedrooms ?? undefined,
      bathrooms: row.bathrooms ?? undefined,
      livingRooms: row.livingRooms ?? undefined,
      kitchens: row.kitchens ?? undefined,
      balconies: row.balconies ?? undefined,
      parking: row.parking ?? undefined,
      furnishing: row.furnishing ?? undefined,
      houseFacing: row.houseFacing ?? undefined,
      amenities: row.amenities ?? [],
      plotShape: row.plotShape ?? undefined,
      frontageFt: row.frontageFt ?? undefined,
      boundaryWall: row.boundaryWall ?? undefined,
      landClearance: row.landClearance ?? false,
      depthFt: row.depthFt ?? undefined,
      zoning: row.zoning ?? undefined,
      setbackAvailable: row.setbackAvailable ?? false,
      setbackText: row.setbackText ?? undefined,
      suitableFor: row.suitableFor ?? [],
      parkingSpaces: row.parkingSpaces ?? undefined,
      landClassification: row.landClassification ?? undefined,
      soilType: row.soilType ?? undefined,
      waterSources: row.waterSources ?? [],
      irrigationType: row.irrigationType ?? undefined,
      currentCrops: row.currentCrops ?? undefined,
      fencing: row.fencing ?? undefined,
      electricityAvailable: row.electricityAvailable ?? false,
      terrain: row.terrain ?? undefined,
      annualYield: row.annualYield ?? undefined,
      farmStructures: row.farmStructures ?? [],
      ceilingHeightFt: row.ceilingHeightFt ?? undefined,
      parkingAvailable: row.parkingAvailable ?? false,
      parkingType: row.parkingType ?? undefined,
      priceType: row.priceType ?? undefined,
      leaseAvailable: row.leaseAvailable ?? false,
      leaseMonthlyRent: row.leaseMonthlyRent ?? undefined,
      commercialFeatures: row.commercialFeatures ?? [],
      zoningLegal: row.zoningLegal ?? undefined,
      heritageType: row.heritageType ?? undefined,
      heritageEra: row.heritageEra ?? undefined,
      heritageGrade: row.heritageGrade ?? undefined,
      courtyard: row.courtyard ?? undefined,
      traditionalFeatures: row.traditionalFeatures ?? [],
      renovationStatus: row.renovationStatus ?? undefined,
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
