import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@repo/db';
import { PropertiesService } from '../properties/properties.service';
import { CartService } from './cart.service';

describe('CartService', () => {
  let service: CartService;

  const prismaMock = {
    cartItem: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      aggregate: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    property: { findUnique: jest.fn() },
  };

  const propertiesMock = { findByIds: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: PrismaClient, useValue: prismaMock },
        { provide: PropertiesService, useValue: propertiesMock },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('add() creates a cart row when no existing row', async () => {
    prismaMock.property.findUnique.mockResolvedValue({ id: 'p1' });
    prismaMock.cartItem.findUnique.mockResolvedValue(null);
    prismaMock.cartItem.create.mockResolvedValue({
      id: 'c1',
      propertyId: 'p1',
      quantity: 2,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    });
    propertiesMock.findByIds.mockResolvedValue([
      { id: 'p1', askingPrice: 100 },
    ]);

    const result = await service.add('u1', { propertyId: 'p1', quantity: 2 });

    expect(prismaMock.cartItem.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { userId: 'u1', propertyId: 'p1', quantity: 2 },
      }),
    );
    expect(result).toMatchObject({ propertyId: 'p1', quantity: 2 });
  });

  it('add() increments the quantity of an existing row, capped at 99', async () => {
    prismaMock.property.findUnique.mockResolvedValue({ id: 'p1' });
    prismaMock.cartItem.findUnique.mockResolvedValue({
      id: 'c1',
      quantity: 98,
    });
    prismaMock.cartItem.update.mockResolvedValue({
      id: 'c1',
      propertyId: 'p1',
      quantity: 99,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    });
    propertiesMock.findByIds.mockResolvedValue([
      { id: 'p1', askingPrice: 100 },
    ]);

    const result = await service.add('u1', { propertyId: 'p1', quantity: 5 });

    expect(prismaMock.cartItem.update).toHaveBeenCalledWith({
      where: { id: 'c1' },
      data: { quantity: 99 },
    });
    expect(result?.quantity).toBe(99);
  });

  it('count() sums quantities across the cart', async () => {
    prismaMock.cartItem.aggregate.mockResolvedValue({ _sum: { quantity: 7 } });
    await expect(service.count('u1')).resolves.toEqual({ count: 7 });
  });

  it('remove() returns removed:false when the item is not in the cart', async () => {
    prismaMock.cartItem.findUnique.mockResolvedValue(null);
    await expect(service.remove('u1', 'p1')).resolves.toEqual({
      removed: false,
    });
  });
});
