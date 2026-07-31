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
  let service: { findAll: jest.Mock; findOne: jest.Mock; create: jest.Mock };

  beforeEach(async () => {
    service = {
      findAll: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({ id: 'p1' }),
      create: jest.fn().mockResolvedValue({ id: 'p1' }),
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

  it('delegates findAll to the shared service with take/skip', async () => {
    await controller.findAll(10, 5);
    expect(service.findAll).toHaveBeenCalledWith({ take: 10, skip: 5 });
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
