import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { PropertyType } from '@repo/db';

// better-auth is ESM-only; the controller imports AuthGuard/RolesGuard which
// pull in `@repo/auth` + `better-auth/node`. Mock them so this spec stays
// focused on the controller. Guards aren't executed on direct method calls.
jest.mock('@repo/auth', () => ({ auth: {} }));
jest.mock('better-auth/node', () => ({ fromNodeHeaders: jest.fn(() => ({})) }));

describe('PropertiesController', () => {
  let controller: PropertiesController;
  let service: { findOne: jest.Mock; create: jest.Mock; findFeed: jest.Mock };

  beforeEach(async () => {
    service = {
      findOne: jest.fn().mockResolvedValue({ id: 'p1' }),
      create: jest.fn().mockResolvedValue({ id: 'p1' }),
      findFeed: jest
        .fn()
        .mockResolvedValue({ items: [], nextCursor: null, hasMore: false }),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertiesController],
      providers: [{ provide: PropertiesService, useValue: service }],
    }).compile();
    controller = module.get(PropertiesController);
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates findFeed to the shared service, coercing first to a number', async () => {
    await controller.findFeed('5', 'cursor-abc');
    expect(service.findFeed).toHaveBeenCalledWith({
      first: 5,
      after: 'cursor-abc',
    });
  });

  it('delegates findFeed with undefined values when no query params are given', async () => {
    await controller.findFeed();
    expect(service.findFeed).toHaveBeenCalledWith({
      first: undefined,
      after: undefined,
    });
  });

  it('delegates create to the shared service with ownerId from @CurrentUser', async () => {
    const input = {
      title: 'T',
      propertyType: PropertyType.RESIDENTIAL_HOUSE,
      askingPrice: 1,
    } as never;
    await controller.create(input, 'u1');
    expect(service.create).toHaveBeenCalledWith(input, 'u1');
  });
});
