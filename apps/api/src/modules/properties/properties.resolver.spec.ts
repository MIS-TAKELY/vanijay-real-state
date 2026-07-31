import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesResolver } from './properties.resolver';
import { PropertiesService } from './properties.service';
import { PropertyType } from '@repo/db';

// `better-auth` ships ESM-only ("type": "module") that Jest (CommonJS) cannot
// load. The resolver imports `AuthGuard`/`RolesGuard`, which import `@repo/auth`
// and `better-auth/node`; mock them so this spec stays focused on the resolver
// and never touches the real auth stack (guards aren't executed on direct method
// calls anyway).
jest.mock('@repo/auth', () => ({ auth: {} }));
jest.mock('better-auth/node', () => ({ fromNodeHeaders: jest.fn(() => ({})) }));

describe('PropertiesResolver', () => {
  let resolver: PropertiesResolver;
  let service: { create: jest.Mock; findAll: jest.Mock; findOne: jest.Mock };

  beforeEach(async () => {
    service = {
      create: jest.fn().mockResolvedValue({ id: 'p1' }),
      findAll: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({ id: 'p1' }),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesResolver,
        { provide: PropertiesService, useValue: service },
      ],
    }).compile();
    resolver = module.get(PropertiesResolver);
  });

  it('is defined', () => {
    expect(resolver).toBeDefined();
  });

  it('delegates createProperty to the shared service with ownerId from auth', async () => {
    const input = {
      title: 'T',
      propertyType: PropertyType.RESIDENTIAL_HOUSE,
      askingPrice: 1,
    };
    await resolver.createProperty(input as never, 'u1');
    expect(service.create).toHaveBeenCalledWith(input, 'u1');
  });

  it('delegates findAll to the shared service', async () => {
    await resolver.findAll(20, 0);
    expect(service.findAll).toHaveBeenCalledWith({ take: 20, skip: 0 });
  });
});

