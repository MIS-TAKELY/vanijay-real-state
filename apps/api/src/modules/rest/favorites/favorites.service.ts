import { Injectable, NotFoundException } from '@nestjs/common';
import { Favorite, PrismaClient } from '@repo/db';
import { PropertiesService } from '../properties/properties.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { AddFavoriteDto } from './dto/add-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly properties: PropertiesService,
    private readonly analytics: AnalyticsService,
  ) {}

  async list(userId: string) {
    const rows = await this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return this.attachProperties(rows);
  }

  async add(userId: string, dto: AddFavoriteDto) {
    await this.requireProperty(dto.propertyId);
    const row = await this.prisma.favorite.upsert({
      where: { userId_propertyId: { userId, propertyId: dto.propertyId } },
      update: { notifyOnPriceChange: dto.notifyOnPriceChange ?? true },
      create: {
        userId,
        propertyId: dto.propertyId,
        notifyOnPriceChange: dto.notifyOnPriceChange ?? true,
      },
    });
    // Track analytics event
    await this.analytics.trackFavoriteAdd(dto.propertyId);
    const [withProperty] = await this.attachProperties([row]);
    return withProperty;
  }

  /** Whether the property is already saved, plus its alert preference. */
  async status(userId: string, propertyId: string) {
    const row = await this.prisma.favorite.findUnique({
      where: { userId_propertyId: { userId, propertyId } },
    });
    return row
      ? { isFavorite: true, notifyOnPriceChange: row.notifyOnPriceChange }
      : { isFavorite: false, notifyOnPriceChange: true };
  }

  async updateNotify(
    userId: string,
    propertyId: string,
    dto: UpdateFavoriteDto,
  ) {
    const row = await this.findOwned(userId, propertyId);
    const updated = await this.prisma.favorite.update({
      where: { id: row.id },
      data: { notifyOnPriceChange: dto.notifyOnPriceChange },
    });
    const [withProperty] = await this.attachProperties([updated]);
    return withProperty;
  }

  async remove(userId: string, propertyId: string) {
    const row = await this.prisma.favorite.findUnique({
      where: { userId_propertyId: { userId, propertyId } },
    });
    if (row) {
      await this.prisma.favorite.delete({ where: { id: row.id } });
      await this.analytics.trackFavoriteRemove(propertyId);
    }
    return { removed: Boolean(row) };
  }

  private async findOwned(userId: string, propertyId: string) {
    const row = await this.prisma.favorite.findUnique({
      where: { userId_propertyId: { userId, propertyId } },
    });
    if (!row) throw new NotFoundException('Favorite not found');
    return row;
  }

  private async requireProperty(propertyId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true },
    });
    if (!property) {
      throw new NotFoundException(`Property ${propertyId} not found`);
    }
  }

  private async attachProperties(rows: Favorite[]) {
    const properties = await this.properties.findByIds(
      rows.map((r) => r.propertyId),
    );
    const byId = new Map(properties.map((p) => [p.id, p]));
    return rows.map((r) => ({
      id: r.id,
      propertyId: r.propertyId,
      notifyOnPriceChange: r.notifyOnPriceChange,
      createdAt: r.createdAt,
      property: byId.get(r.propertyId) ?? null,
    }));
  }
}
