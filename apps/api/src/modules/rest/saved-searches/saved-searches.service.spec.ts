import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@repo/db';
import { PropertiesService } from '../properties/properties.service';
import { SavedSearchesService } from './saved-searches.service';

describe('SavedSearchesService', () => {
  let service: SavedSearchesService;

  const prismaMock = {
    savedSearch: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const propertiesMock = { countMatches: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    propertiesMock.countMatches.mockResolvedValue(0);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavedSearchesService,
        { provide: PrismaClient, useValue: prismaMock },
        { provide: PropertiesService, useValue: propertiesMock },
      ],
    }).compile();

    service = module.get<SavedSearchesService>(SavedSearchesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create() defaults frequency to INSTANT and generates a label from filters', async () => {
    prismaMock.savedSearch.create.mockResolvedValue({
      id: 's1',
      label: 'Kathmandu, Residential, Under 20L',
      filters: { district: 'Kathmandu', type: 'residential', price: 'under-20l' },
      alertFrequency: 'INSTANT',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    });

    const result = await service.create('u1', {
      filters: { district: 'Kathmandu', type: 'residential', price: 'under-20l' },
    });

    expect(prismaMock.savedSearch.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'u1',
          label: 'Kathmandu, Residential, Under 20L',
          alertFrequency: 'INSTANT',
        }),
      }),
    );
    expect(result.alertFrequency).toBe('INSTANT');
    expect(result.matchCount).toBe(0);
  });

  it('create() honours an explicit label and frequency', async () => {
    prismaMock.savedSearch.create.mockResolvedValue({
      id: 's1',
      label: 'My dream plot',
      filters: { district: 'Lalitpur' },
      alertFrequency: 'DAILY_DIGEST',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    });

    const result = await service.create('u1', {
      label: 'My dream plot',
      filters: { district: 'Lalitpur' },
      alertFrequency: 'DAILY_DIGEST',
    });

    expect(result.label).toBe('My dream plot');
    expect(result.alertFrequency).toBe('DAILY_DIGEST');
  });

  it('list() computes match counts via PropertiesService for each row', async () => {
    const rows = [
      {
        id: 's1',
        label: 'Land',
        filters: { district: 'Pokhara' },
        alertFrequency: 'INSTANT',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      },
    ];
    prismaMock.savedSearch.findMany.mockResolvedValue(rows);
    propertiesMock.countMatches.mockResolvedValue(12);

    const result = await service.list('u1');

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: 's1', label: 'Land', matchCount: 12 });
    expect(propertiesMock.countMatches).toHaveBeenCalledWith({
      district: 'Pokhara',
    });
  });

  it('update() renames the owned row', async () => {
    prismaMock.savedSearch.findFirst.mockResolvedValue({
      id: 's1',
      userId: 'u1',
      label: 'Old name',
    });
    prismaMock.savedSearch.update.mockResolvedValue({
      id: 's1',
      label: 'New name',
      filters: { district: 'Kathmandu' },
      alertFrequency: 'INSTANT',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    });

    const result = await service.update('u1', 's1', { label: 'New name' });

    expect(prismaMock.savedSearch.update).toHaveBeenCalledWith({
      where: { id: 's1' },
      data: { label: 'New name' },
    });
    expect(result.label).toBe('New name');
  });

  it('update() throws NotFound for another user’s row', async () => {
    prismaMock.savedSearch.findFirst.mockResolvedValue(null);
    await expect(service.update('u1', 'ghost', { label: 'x' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('remove() deletes the owned row and reports success', async () => {
    prismaMock.savedSearch.findFirst.mockResolvedValue({
      id: 's1',
      userId: 'u1',
    });
    prismaMock.savedSearch.delete.mockResolvedValue({ id: 's1' });

    await expect(service.remove('u1', 's1')).resolves.toEqual({ removed: true });
    expect(prismaMock.savedSearch.delete).toHaveBeenCalledWith({
      where: { id: 's1' },
    });
  });

  it('remove() throws NotFound when the row is missing', async () => {
    prismaMock.savedSearch.findFirst.mockResolvedValue(null);
    await expect(service.remove('u1', 'ghost')).rejects.toThrow(
      NotFoundException,
    );
  });
});
