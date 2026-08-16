import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyInput } from './dto/create-property.input';
import { PrismaClient, PropertyType } from '@repo/db';
import { encodeCursor } from 'src/common/pagination';

/**
 * Demonstrates the Phase 1 benefit: `PrismaClient` is injected and mocked,
 * so the domain logic is unit-tested in isolation — no database required.
 */
describe('PropertiesService', () => {
  let service: PropertiesService;
  let prisma: {
    property: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
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
        findFirst: jest.fn().mockResolvedValue(row),
        findUnique: jest.fn().mockResolvedValue(row),
        create: jest.fn().mockResolvedValue(row),
        update: jest.fn().mockResolvedValue(row),
        delete: jest.fn().mockResolvedValue(row),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        { provide: PrismaClient, useValue: prisma },
      ],
    }).compile();
    service = module.get(PropertiesService);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  it('findOne throws NotFoundException when no LIVE listing matches the slug/id', async () => {
    prisma.property.findFirst.mockResolvedValueOnce(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('findOne looks up a LIVE property by slug OR id', async () => {
    await service.findOne('my-house-abc');
    expect(prisma.property.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: 'LIVE',
          OR: [{ slug: 'my-house-abc' }, { id: 'my-house-abc' }],
        },
      }),
    );
  });

  it('create passes ownerId from auth (not the body) and generates listingCode/slug', async () => {
    const input: CreatePropertyInput = {
      title: 'My House',
      propertyType: PropertyType.RESIDENTIAL_HOUSE,
      askingPrice: 1500000,
      landArea: { ropani: 1, aana: 0, totalSqFt: 508.74, totalSqMeters: 47.29 },
      location: {
        province: 'Bagmati',
        district: 'Lalitpur',
        municipality: 'Lalitpur Metropolitan City',
        wardNumber: 6,
        areaName: 'Patan',
      },
    };
    const result = await service.create(input, 'u1');
    const callArg = prisma.property.create.mock.calls[0][0];
    expect(callArg.data.ownerId).toBe('u1');
    expect(callArg.data.listingCode).toMatch(/^PROP-/);
    expect(callArg.data.slug).toMatch(/my-house-/);
    expect(callArg.data.originalAskingPrice).toBe(1500000);
    expect(result.id).toBe('p1');
  });

  it('create publishes the listing immediately as LIVE + UNVERIFIED so it appears on public pages', async () => {
    const input: CreatePropertyInput = {
      title: 'My House',
      propertyType: PropertyType.RESIDENTIAL_HOUSE,
      askingPrice: 1500000,
      landArea: { ropani: 1, aana: 0, totalSqFt: 508.74, totalSqMeters: 47.29 },
      location: {
        province: 'Bagmati',
        district: 'Lalitpur',
        municipality: 'Lalitpur Metropolitan City',
        wardNumber: 6,
        areaName: 'Patan',
      },
    };
    await service.create(input, 'u1');
    const callArg = prisma.property.create.mock.calls[0][0];
    expect(callArg.data.status).toBe('LIVE');
    expect(callArg.data.verificationLevel).toBe('UNVERIFIED');
    expect(callArg.data.publishedAt).toBeInstanceOf(Date);
  });

  it('update checks existence before updating', async () => {
    prisma.property.findUnique.mockResolvedValueOnce(null);
    await expect(
      service.update({ id: 'x', title: 'new' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.property.update).not.toHaveBeenCalled();
  });

  it('update resets verificationLevel to UNVERIFIED when listing content changes', async () => {
    await service.update({ id: 'p1', title: 'Renamed', askingPrice: 2000000 });
    const callArg = prisma.property.update.mock.calls[0][0];
    expect(callArg.data.verificationLevel).toBe('UNVERIFIED');
  });

  it('update keeps verificationLevel for status-only PATCHes (mark sold / archive)', async () => {
    await service.update({ id: 'p1', status: 'SOLD' });
    const callArg = prisma.property.update.mock.calls[0][0];
    expect(callArg.data).not.toHaveProperty('verificationLevel');
  });

  it('remove checks existence before deleting', async () => {
    await service.remove('p1');
    expect(prisma.property.findUnique).toHaveBeenCalledWith({
      where: { id: 'p1' },
    });
    expect(prisma.property.delete).toHaveBeenCalledWith({
      where: { id: 'p1' },
    });
  });

  // ---- keyset (cursor) pagination: findFeed ----

  it('findFeed fetches first+1 and reports hasMore + nextCursor when a next page exists', async () => {
    const feedRows = [
      { ...row, id: 'p3', createdAt: new Date('2026-08-01T00:00:00Z') },
      { ...row, id: 'p2', createdAt: new Date('2026-07-31T00:00:00Z') },
      { ...row, id: 'p1', createdAt: new Date('2026-07-30T00:00:00Z') },
    ];
    prisma.property.findMany.mockResolvedValueOnce(feedRows);

    const result = await service.findFeed({ first: 2 });

    // asked for first + 1 (lookahead), newest-first by the composite key
    expect(prisma.property.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 3,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        // Cursor + filters are AND-wrapped; with no cursor/filters the AND
        // holds a single empty filter.
        where: { status: 'LIVE', AND: [{}] },
      }),
    );
    expect(result.items).toHaveLength(2);
    expect(result.items[0].id).toBe('p3'); // newest first
    expect(result.items[1].id).toBe('p2');
    expect(result.hasMore).toBe(true);
    expect(result.nextCursor).not.toBeNull();
    // nextCursor must encode the LAST item of THIS page (p2) — opaque, but we
    // decode it here to prove the round-trip.
    const decoded = JSON.parse(
      Buffer.from(result.nextCursor as string, 'base64url').toString('utf8'),
    );
    expect(decoded.id).toBe('p2');
    expect(decoded.createdAt).toBe('2026-07-31T00:00:00.000Z');
  });

  it('findFeed returns hasMore=false and a null cursor on the last page', async () => {
    prisma.property.findMany.mockResolvedValueOnce([
      { ...row, id: 'p1', createdAt: new Date('2026-08-01T00:00:00Z') },
    ]);
    const result = await service.findFeed({ first: 20 });
    expect(result.items).toHaveLength(1);
    expect(result.hasMore).toBe(false);
    expect(result.nextCursor).toBeNull();
  });

  it('findFeed applies the after cursor as a composite keyset OR clause', async () => {
    prisma.property.findMany.mockResolvedValueOnce([]);
    const after = encodeCursor({
      createdAt: '2026-07-31T00:00:00.000Z',
      id: 'p2',
    });
    await service.findFeed({ first: 10, after });

    const arg = prisma.property.findMany.mock.calls.at(-1)?.[0];
    expect(arg.where).toEqual({
      status: 'LIVE',
      AND: [
        {
          OR: [
            { createdAt: { lt: '2026-07-31T00:00:00.000Z' } },
            {
              createdAt: { equals: '2026-07-31T00:00:00.000Z' },
              id: { lt: 'p2' },
            },
          ],
        },
        {},
      ],
    });
    expect(arg.take).toBe(11); // first(10) + 1 lookahead
    expect(arg.orderBy).toEqual([{ createdAt: 'desc' }, { id: 'desc' }]);
  });

  it('findFeed clamps first to MAX_TAKE before adding the lookahead', async () => {
    prisma.property.findMany.mockResolvedValueOnce([]);
    await service.findFeed({ first: 9999 });
    expect(prisma.property.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 101 }), // 100 (clamped) + 1
    );
  });

  it('findFeed throws BadRequestException on a malformed cursor (and never hits the DB)', async () => {
    await expect(
      service.findFeed({ after: 'not-a-valid-cursor' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.property.findMany).not.toHaveBeenCalled();
  });
});
