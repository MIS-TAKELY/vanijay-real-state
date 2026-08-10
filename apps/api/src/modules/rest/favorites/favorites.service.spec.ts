import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@repo/db';
import { PropertiesService } from '../properties/properties.service';
import { FavoritesService } from './favorites.service';

describe('FavoritesService', () => {
  let service: FavoritesService;

  const prismaMock = {
    favorite: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
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
        FavoritesService,
        { provide: PrismaClient, useValue: prismaMock },
        { provide: PropertiesService, useValue: propertiesMock },
      ],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('add() attaches the property summary and upserts onto notifyOnPriceChange', async () => {
    prismaMock.property.findUnique.mockResolvedValue({ id: 'p1' });
    prismaMock.favorite.upsert.mockResolvedValue({
      id: 'f1',
      propertyId: 'p1',
      notifyOnPriceChange: true,
      createdAt: new Date('2026-01-01'),
    });
    propertiesMock.findByIds.mockResolvedValue([{ id: 'p1', title: 'Plot' }]);

    const result = await service.add('u1', { propertyId: 'p1' });

    expect(prismaMock.favorite.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_propertyId: { userId: 'u1', propertyId: 'p1' } },
      }),
    );
    expect(result).toMatchObject({
      propertyId: 'p1',
      property: { id: 'p1', title: 'Plot' },
    });
  });

  it('add() throws NotFound when the property does not exist', async () => {
    prismaMock.property.findUnique.mockResolvedValue(null);
    await expect(service.add('u1', { propertyId: 'ghost' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('status() reports unsaved when no favorite row exists', async () => {
    prismaMock.favorite.findUnique.mockResolvedValue(null);
    await expect(service.status('u1', 'p1')).resolves.toEqual({
      isFavorite: false,
      notifyOnPriceChange: true,
    });
  });

  it('remove() returns removed:false when not favorited', async () => {
    prismaMock.favorite.findUnique.mockResolvedValue(null);
    await expect(service.remove('u1', 'p1')).resolves.toEqual({
      removed: false,
    });
  });
});
