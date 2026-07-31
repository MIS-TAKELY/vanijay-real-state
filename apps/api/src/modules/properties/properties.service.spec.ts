import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PropertiesService } from './properties.service';
import { CreatePropertyInput } from './dto/create-property.input';
import { PropertyType } from '@repo/db';

/**
 * Demonstrates the Phase 1 benefit: `PrismaService` is injected and mocked,
 * so the domain logic is unit-tested in isolation — no database required.
 */
describe('PropertiesService', () => {
  let service: PropertiesService;
  let prisma: {
    property: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const row = {
    id: 'p1',
    listingCode: 'PROP-123-ABC',
    slug: 'my-house-abc',
    title: 'My House',
    description: 'desc',
    propertyType: PropertyType.RESIDENTIAL_HOUSE,
    status: 'LIVE',
    verificationLevel: 'UNVERIFIED',
    askingPrice: { toString: () => '1500000' }, // Prisma.Decimal-like
    pricePerAana: null,
    roadAccessWidthFt: null,
    roadType: null,
    facing: null,
    isCornerPlot: false,
    ownerId: 'u1',
    agentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      property: {
        findMany: jest.fn().mockResolvedValue([row]),
        findUnique: jest.fn().mockResolvedValue(row),
        create: jest.fn().mockResolvedValue(row),
        update: jest.fn().mockResolvedValue(row),
        delete: jest.fn().mockResolvedValue(row),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(PropertiesService);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll maps Decimal askingPrice to a number', async () => {
    const result = await service.findAll({ take: 5 });
    expect(prisma.property.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 5, where: { status: 'LIVE' } }),
    );
    expect(result[0].askingPrice).toBe(1500000);
    expect(typeof result[0].askingPrice).toBe('number');
  });

  it('findAll caps take to MAX_TAKE', async () => {
    await service.findAll({ take: 9999 });
    expect(prisma.property.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 }),
    );
  });

  it('findOne throws NotFoundException when missing', async () => {
    prisma.property.findUnique.mockResolvedValueOnce(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('create passes ownerId from auth (not the body) and generates listingCode/slug', async () => {
    const input: CreatePropertyInput = {
      title: 'My House',
      propertyType: PropertyType.RESIDENTIAL_HOUSE,
      askingPrice: 1500000,
    };
    const result = await service.create(input, 'u1');
    const callArg = prisma.property.create.mock.calls[0][0];
    expect(callArg.data.ownerId).toBe('u1');
    expect(callArg.data.listingCode).toMatch(/^PROP-/);
    expect(callArg.data.slug).toMatch(/my-house-/);
    expect(callArg.data.originalAskingPrice).toBe(1500000);
    expect(result.id).toBe('p1');
  });

  it('update checks existence before updating', async () => {
    prisma.property.findUnique.mockResolvedValueOnce(null);
    await expect(service.update({ id: 'x', title: 'new' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prisma.property.update).not.toHaveBeenCalled();
  });

  it('remove checks existence before deleting', async () => {
    await service.remove('p1');
    expect(prisma.property.findUnique).toHaveBeenCalledWith({ where: { id: 'p1' } });
    expect(prisma.property.delete).toHaveBeenCalledWith({ where: { id: 'p1' } });
  });
});
