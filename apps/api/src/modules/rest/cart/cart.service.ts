import { Injectable, NotFoundException } from '@nestjs/common';
import { CartItem, PrismaClient } from '@repo/db';
import { PropertiesService } from '../properties/properties.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

const MAX_QUANTITY = 99;

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly properties: PropertiesService,
    private readonly analytics: AnalyticsService,
  ) {}

  /**
   * The current user's cart, most recently updated first, each with the embedded
   * property summary and a `subtotal` (quantity × asking price, in NPR).
   */
  async list(userId: string) {
    const rows = await this.prisma.cartItem.findMany({
      where: { userId },
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    });
    const properties = await this.properties.findByIds(
      rows.map((r) => r.propertyId),
    );
    const byId = new Map(properties.map((p) => [p.id, p]));
    return rows.map((r) => {
      const property = byId.get(r.propertyId) ?? null;
      return {
        id: r.id,
        propertyId: r.propertyId,
        quantity: r.quantity,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        property,
        subtotal: property ? property.askingPrice * r.quantity : null,
      };
    });
  }

  /** Total number of items across the cart (sum of quantities). */
  async count(userId: string) {
    const aggregate = await this.prisma.cartItem.aggregate({
      where: { userId },
      _sum: { quantity: true },
    });
    return { count: aggregate._sum.quantity ?? 0 };
  }

  async add(userId: string, dto: AddCartItemDto) {
    await this.requireProperty(dto.propertyId);
    const quantity = dto.quantity ?? 1;

    const existing = await this.findOwned(userId, dto.propertyId).catch(
      () => null,
    );
    const row = existing
      ? await this.prisma.cartItem.update({
          where: { id: existing.id },
          data: {
            quantity: Math.min(existing.quantity + quantity, MAX_QUANTITY),
          },
        })
      : await this.prisma.cartItem.create({
          data: {
            userId,
            propertyId: dto.propertyId,
            quantity,
          },
        });

    await this.analytics.trackCartAdd(dto.propertyId);

    const [withProperty] = await this.attachProperties([row]);
    return withProperty;
  }

  async updateQuantity(
    userId: string,
    propertyId: string,
    dto: UpdateCartItemDto,
  ) {
    const row = await this.findOwned(userId, propertyId);
    const updated = await this.prisma.cartItem.update({
      where: { id: row.id },
      data: { quantity: Math.min(dto.quantity, MAX_QUANTITY) },
    });
    const [withProperty] = await this.attachProperties([updated]);
    return withProperty;
  }

  async remove(userId: string, propertyId: string) {
    const row = await this.findOwned(userId, propertyId).catch(() => null);
    if (row) {
      await this.prisma.cartItem.delete({ where: { id: row.id } });
      await this.analytics.trackCartRemove(propertyId);
    }
    return { removed: Boolean(row) };
  }

  private async findOwned(userId: string, propertyId: string) {
    const row = await this.prisma.cartItem.findUnique({
      where: { userId_propertyId: { userId, propertyId } },
    });
    if (!row) throw new NotFoundException('Cart item not found');
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

  private async attachProperties(rows: CartItem[]) {
    const properties = await this.properties.findByIds(
      rows.map((r) => r.propertyId),
    );
    const byId = new Map(properties.map((p) => [p.id, p]));
    return rows.map((r) => {
      const property = byId.get(r.propertyId) ?? null;
      return {
        id: r.id,
        propertyId: r.propertyId,
        quantity: r.quantity,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        property,
        subtotal: property ? property.askingPrice * r.quantity : null,
      };
    });
  }
}
