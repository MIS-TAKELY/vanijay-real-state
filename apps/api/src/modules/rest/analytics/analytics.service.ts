import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@repo/db';
import { PropertiesService } from '../properties/properties.service';

export interface TrendingPropertyDto {
  propertyId: string;
  title: string;
  slug: string;
  imageUrl?: string;
  location: string;
  askingPrice: number;
  trendingScore: number;
  viewCount: number;
  favoriteCount: number;
  cartAddCount: number;
}

export interface TrendingPropertiesResponse {
  items: TrendingPropertyDto[];
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaClient) {}

  async getTrendingProperties(
    limit: number = 10,
    period: '24h' | '7d' | '30d' = '7d',
  ): Promise<TrendingPropertiesResponse> {
    const properties = await this.prisma.property.findMany({
      where: {
        status: 'LIVE',
        analytics: {
          trendingScore: { gt: 0 },
        },
      },
      include: {
        analytics: true,
        media: {
          where: { isCover: true },
          take: 1,
          select: { url: true },
        },
        location: {
          select: { district: true, municipality: true, areaName: true },
        },
      },
      orderBy: {
        analytics: {
          trendingScore: 'desc',
        },
      },
      take: limit,
    });

    const now = new Date();
    const needsRecalc = properties.some(
      (p) =>
        p.analytics &&
        p.analytics.lastCalculatedAt &&
        now.getTime() - new Date(p.analytics.lastCalculatedAt).getTime() >
          60 * 60 * 1000,
    );

    if (needsRecalc) {
      await this.recalculateTrendingScores();
      return this.getTrendingProperties(limit, period);
    }

    const items: TrendingPropertyDto[] = properties.map((p) => {
      const a = p.analytics!;
      const loc = p.location;
      const img = p.media[0];
      return {
        propertyId: p.id,
        title: p.title,
        slug: p.slug,
        imageUrl: img?.url,
        location: loc
          ? `${loc.areaName || loc.municipality}, ${loc.district}`
          : 'Location TBD',
        askingPrice: Number(p.askingPrice),
        trendingScore: a.trendingScore,
        viewCount: a.viewCount,
        favoriteCount: a.favoriteCount,
        cartAddCount: a.cartAddCount,
      };
    });

    return { items };
  }

  async trackView(
    propertyId: string,
    data: {
      userId?: string;
      ipHash?: string;
      userAgent?: string;
      referrer?: string;
    },
  ): Promise<void> {
    await this.prisma.propertyViewEvent.create({
      data: { propertyId, ...data },
    });
    await this.incrementAnalytics(propertyId, {
      viewCount: 1,
      viewsLast24h: 1,
      viewsLast7d: 1,
      viewsLast30d: 1,
    });
  }

  async trackSearch(
    propertyId: string,
    data: { userId?: string; searchQuery?: string; filters?: any },
  ): Promise<void> {
    await this.prisma.propertySearchEvent.create({
      data: { propertyId, ...data },
    });
    await this.incrementAnalytics(propertyId, { searchCount: 1 });
  }

  async trackShare(
    propertyId: string,
    data: { userId?: string; platform: string },
  ): Promise<void> {
    await this.prisma.propertyShareEvent.create({
      data: { propertyId, ...data },
    });
    await this.incrementAnalytics(propertyId, { shareCount: 1 });
  }

  async trackFavoriteAdd(propertyId: string): Promise<void> {
    await this.incrementAnalytics(propertyId, {
      favoriteCount: 1,
      favoritesLast24h: 1,
      favoritesLast7d: 1,
      favoritesLast30d: 1,
    });
  }

  async trackFavoriteRemove(propertyId: string): Promise<void> {
    await this.incrementAnalytics(propertyId, { favoriteCount: -1 });
  }

  async trackCartAdd(propertyId: string): Promise<void> {
    await this.incrementAnalytics(propertyId, {
      cartAddCount: 1,
      cartAddsLast24h: 1,
      cartAddsLast7d: 1,
      cartAddsLast30d: 1,
    });
  }

  async trackCartRemove(propertyId: string): Promise<void> {
    await this.incrementAnalytics(propertyId, { cartAddCount: -1 });
  }

  async trackInquiry(propertyId: string): Promise<void> {
    await this.incrementAnalytics(propertyId, { inquiryCount: 1 });
  }

  async trackPhoneClick(
    propertyId: string,
    data: {
      userId?: string;
      ipHash?: string;
      userAgent?: string;
      referrer?: string;
    },
  ): Promise<void> {
    await this.prisma.propertyPhoneClickEvent.create({
      data: { propertyId, ...data },
    });
    await this.incrementAnalytics(propertyId, {
      phoneClickCount: 1,
      phoneClicksLast24h: 1,
      phoneClicksLast7d: 1,
      phoneClicksLast30d: 1,
    });
  }

  async isLiveProperty(propertyId: string): Promise<boolean> {
    const found = await this.prisma.property.findFirst({
      where: { id: propertyId, status: 'LIVE' },
      select: { id: true },
    });
    return !!found;
  }

  async getSellerContact(propertyId: string) {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, status: 'LIVE' },
      select: {
        owner: {
          select: {
            phoneNumber: true,
            name: true,
          },
        },
        agent: {
          select: {
            phoneNumber: true,
            name: true,
          },
        },
      },
    });

    if (!property) return null;

    const contact = property.agent?.phoneNumber
      ? {
          name: property.agent.name,
          phoneNumber: property.agent.phoneNumber,
          via: 'AGENT' as const,
        }
      : {
          name: property.owner?.name ?? null,
          phoneNumber: property.owner?.phoneNumber ?? null,
          via: 'OWNER' as const,
        };

    return contact.phoneNumber ? contact : null;
  }

  async isPropertyOwner(propertyId: string, userId: string): Promise<boolean> {
    const found = await this.prisma.property.findFirst({
      where: { id: propertyId, ownerId: userId },
      select: { id: true },
    });
    return !!found;
  }

  async getSimilarProperties(propertyId: string, limit: number = 10) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        propertyType: true,
        askingPrice: true,
        location: {
          select: {
            district: true,
            municipality: true,
            areaName: true,
          },
        },
      },
    });

    if (!property) {
      return { items: [], total: 0 };
    }

    const priceRange = 0.2; // 20% price range
    const askingPrice = Number(property.askingPrice);
    const minPrice = askingPrice * (1 - priceRange);
    const maxPrice = askingPrice * (1 + priceRange);

    const similar = await this.prisma.property.findMany({
      where: {
        id: { not: propertyId },
        status: 'LIVE',
        propertyType: property.propertyType,
        askingPrice: { gte: minPrice, lte: maxPrice },
        ...(property.location?.district && {
          location: {
            district: property.location.district,
          },
        }),
      },
      include: {
        location: true,
        landArea: true,
        media: {
          orderBy: { sortOrder: 'asc' },
          select: { url: true, altText: true, sortOrder: true, isCover: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return {
      items: similar.map(PropertiesService.mapToResponse),
      total: similar.length,
    };
  }

  async getRecentlyViewedProperties(userId: string, limit: number = 10) {
    const recentViews = await this.prisma.propertyViewEvent.findMany({
      where: { userId },
      distinct: ['propertyId'],
      orderBy: { viewedAt: 'desc' },
      take: limit,
      select: { propertyId: true },
    });

    const propertyIds = recentViews.map((v) => v.propertyId);

    if (propertyIds.length === 0) {
      return { items: [], total: 0 };
    }

    const properties = await this.prisma.property.findMany({
      where: {
        id: { in: propertyIds },
        status: 'LIVE',
      },
      include: {
        location: true,
        landArea: true,
        media: {
          orderBy: { sortOrder: 'asc' },
          select: { url: true, altText: true, sortOrder: true, isCover: true },
        },
      },
    });

    // Preserve the order from recent views
    const orderedProperties = propertyIds
      .map((id) => properties.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => p !== undefined);

    return {
      items: orderedProperties.map(PropertiesService.mapToResponse),
      total: orderedProperties.length,
    };
  }

  async getFeaturedProperties(limit: number = 10) {
    const properties = await this.prisma.property.findMany({
      where: {
        status: 'LIVE',
        isFeatured: true,
      },
      include: {
        location: true,
        landArea: true,
        media: {
          orderBy: { sortOrder: 'asc' },
          select: { url: true, altText: true, sortOrder: true, isCover: true },
        },
      },
      orderBy: { publishedAt: { sort: 'desc' } },
      take: limit,
    });

    return {
      items: properties.map(PropertiesService.mapToResponse),
      total: properties.length,
    };
  }

  async getRecentlyAddedProperties(limit: number = 10) {
    const properties = await this.prisma.property.findMany({
      where: {
        status: 'LIVE',
      },
      include: {
        location: true,
        landArea: true,
        media: {
          orderBy: { sortOrder: 'asc' },
          select: { url: true, altText: true, sortOrder: true, isCover: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return {
      items: properties.map(PropertiesService.mapToResponse),
      total: properties.length,
    };
  }

  async getPropertyAnalytics(propertyId: string, userId: string) {
    // Verify the user owns this property
    const isOwner = await this.isPropertyOwner(propertyId, userId);
    if (!isOwner) {
      throw new Error('You do not have permission to view this analytics');
    }

    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      include: { analytics: true },
    });

    if (!property) {
      throw new Error('Property not found');
    }

    const analytics = property.analytics;

    return {
      propertyId: property.id,
      title: property.title,
      slug: property.slug,
      viewCount: analytics?.viewCount || 0,
      favoriteCount: analytics?.favoriteCount || 0,
      cartAddCount: analytics?.cartAddCount || 0,
      inquiryCount: analytics?.inquiryCount || 0,
      searchCount: analytics?.searchCount || 0,
      shareCount: analytics?.shareCount || 0,
      phoneClickCount: analytics?.phoneClickCount || 0,
      trendingScore: analytics?.trendingScore || 0,
    };
  }

  private async incrementAnalytics(
    propertyId: string,
    increments: Record<string, number>,
  ): Promise<void> {
    const updateData: Record<string, any> = {};
    for (const [key, value] of Object.entries(increments)) {
      if (value !== undefined) {
        updateData[key] = { increment: value };
      }
    }
    const createData: Record<string, any> = { propertyId };
    for (const [key, value] of Object.entries(increments)) {
      if (value !== undefined) {
        createData[key] = value;
      }
    }
    await this.prisma.propertyAnalytics.upsert({
      where: { propertyId },
      create: createData as any,
      update: updateData,
    });
  }

  async recalculateTrendingScores(): Promise<void> {
    const properties = await this.prisma.property.findMany({
      where: { status: 'LIVE' },
      include: { analytics: true },
    });

    const now = new Date();
    const day24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const day7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const day30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    for (const property of properties) {
      const [v24, v7, v30, f24, f7, f30, c24, c7, c30, p24, p7, p30] =
        await Promise.all([
          this.prisma.propertyViewEvent.count({
            where: { propertyId: property.id, viewedAt: { gte: day24h } },
          }),
          this.prisma.propertyViewEvent.count({
            where: { propertyId: property.id, viewedAt: { gte: day7 } },
          }),
          this.prisma.propertyViewEvent.count({
            where: { propertyId: property.id, viewedAt: { gte: day30 } },
          }),
          this.prisma.favorite.count({
            where: { propertyId: property.id, createdAt: { gte: day24h } },
          }),
          this.prisma.favorite.count({
            where: { propertyId: property.id, createdAt: { gte: day7 } },
          }),
          this.prisma.favorite.count({
            where: { propertyId: property.id, createdAt: { gte: day30 } },
          }),
          this.prisma.cartItem.count({
            where: { propertyId: property.id, createdAt: { gte: day24h } },
          }),
          this.prisma.cartItem.count({
            where: { propertyId: property.id, createdAt: { gte: day7 } },
          }),
          this.prisma.cartItem.count({
            where: { propertyId: property.id, createdAt: { gte: day30 } },
          }),
          this.prisma.propertyPhoneClickEvent.count({
            where: { propertyId: property.id, clickedAt: { gte: day24h } },
          }),
          this.prisma.propertyPhoneClickEvent.count({
            where: { propertyId: property.id, clickedAt: { gte: day7 } },
          }),
          this.prisma.propertyPhoneClickEvent.count({
            where: { propertyId: property.id, clickedAt: { gte: day30 } },
          }),
        ]);

      const viewScore = v24 * 1.0 + v7 * 0.5 + v30 * 0.1;
      const favScore = (f24 * 1.0 + f7 * 0.5 + f30 * 0.1) * 5;
      const cartScore = (c24 * 1.0 + c7 * 0.5 + c30 * 0.1) * 10;
      const phoneClickScore = (p24 * 1.0 + p7 * 0.5 + p30 * 0.1) * 8;
      const a = property.analytics;
      const inquiryScore = (a?.inquiryCount || 0) * 20;
      const searchScore = (a?.searchCount || 0) * 0.5;
      const shareScore = (a?.shareCount || 0) * 3;
      const score =
        viewScore +
        favScore +
        cartScore +
        phoneClickScore +
        inquiryScore +
        searchScore +
        shareScore;

      await this.prisma.propertyAnalytics.upsert({
        where: { propertyId: property.id },
        create: {
          propertyId: property.id,
          viewsLast24h: v24,
          viewsLast7d: v7,
          viewsLast30d: v30,
          favoritesLast24h: f24,
          favoritesLast7d: f7,
          favoritesLast30d: f30,
          cartAddsLast24h: c24,
          cartAddsLast7d: c7,
          cartAddsLast30d: c30,
          phoneClicksLast24h: p24,
          phoneClicksLast7d: p7,
          phoneClicksLast30d: p30,
          trendingScore: score,
          lastCalculatedAt: now,
        },
        update: {
          viewsLast24h: v24,
          viewsLast7d: v7,
          viewsLast30d: v30,
          favoritesLast24h: f24,
          favoritesLast7d: f7,
          favoritesLast30d: f30,
          cartAddsLast24h: c24,
          cartAddsLast7d: c7,
          cartAddsLast30d: c30,
          phoneClicksLast24h: p24,
          phoneClicksLast7d: p7,
          phoneClicksLast30d: p30,
          trendingScore: score,
          lastCalculatedAt: now,
        },
      });
    }
  }
}
