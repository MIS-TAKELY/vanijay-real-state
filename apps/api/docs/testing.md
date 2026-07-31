# Testing

The API ships with Jest configured (`package.json` `jest` config). There are two
suites:

- **Unit tests** — `src/**/*.spec.ts`, run by `pnpm test`. Isolate a single
  class with `Test.createTestingModule` and mock dependencies.
- **E2e tests** — `test/**/*.e2e-spec.ts`, run by `pnpm test:e2e`. Boot the whole
  `AppModule` and hit routes/resolvers with `supertest`.

Both Jest configs map `^src/(.*)$` to `<rootDir>/...` so `src/...` imports resolve.

```bash
pnpm test          # unit (watch mode: pnpm test:watch)
pnpm test:e2e      # e2e
pnpm test:cov      # coverage report -> coverage/
```

## Unit test pattern

Use `Test.createTestingModule` and provide fakes for dependencies. For a service
that calls the `prisma` singleton today, mock the module; after the
[PrismaService upgrade](./scalability-roadmap.md#7-prisma-as-an-injectable-service),
inject the `PrismaService` token and mock it cleanly.

```ts
// properties.service.spec.ts
import { Test } from '@nestjs/testing';
import { PropertiesService } from './properties.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PropertiesService', () => {
  let service: PropertiesService;
  let prisma: { property: { findUnique: jest.Mock; create: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      property: {
        findUnique: jest.fn().mockResolvedValue({ id: 'p1', title: 'House' }),
        create: jest.fn().mockResolvedValue({ id: 'p1', title: 'House' }),
      },
    };
    const module = await Test.createTestingModule({
      providers: [
        PropertiesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(PropertiesService);
  });

  it('creates a property', async () => {
    const result = await service.create({ title: 'House' } as any, 'u1');
    expect(prisma.property.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ title: 'House', ownerId: 'u1' }),
    });
    expect(result.id).toBe('p1');
  });
});
```

The existing specs (`app.controller.spec.ts`, `properties.*.spec.ts`,
`role.guard.spec.ts`) are minimal smoke tests — extend them with real assertions.

## Resolver/controller unit tests

For resolvers/controllers, provide the service as a fake:

```ts
const module = await Test.createTestingModule({
  providers: [
    PropertiesResolver,
    { provide: PropertiesService, useValue: { findAll: jest.fn().mockResolvedValue([]) } },
  ],
}).compile();
```

For guards that use `Reflector` (like `RolesGuard`), instantiate with
`new RolesGuard(new Reflector())` (already done in `role.guard.spec.ts`).

## E2e test pattern

`test/app.e2e-spec.ts` boots `AppModule` and hits `/`. Extend the same approach
for REST and GraphQL. **Important:** to match production behavior, the e2e app
must also apply the global `ValidationPipe`:

```ts
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Properties (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterEach(async () => { await app.close(); });

  it('GET /', () =>
    request(app.getHttpServer()).get('/').expect(200).expect('Hello World!'));

  it('creates a property via GraphQL', () =>
    request(app.getHttpServer())
      .post('/api/v1/vanijay-real-state')
      .send({
        query: `mutation { createProperty(createPropertyInput: { title: "House", type: RESIDENTIAL_HOUSE }) { id title } }`,
      })
      .expect(200));
});
```

> GraphQL requests are POSTed to the configured `path`
> (`/api/v1/vanijay-real-state`) with a JSON body `{ query, variables }`.

## Mocking Prisma in e2e

For true e2e you may want a real (test) database. Two common approaches:

1. **Test database** — set `DATABASE_URL` to a throwaway DB, run
   `prisma migrate deploy` before tests, truncate between runs.
2. **Module override** — keep using `Test.createTestingModule` and
   `.overrideProvider(PrismaService).useValue({...mocks})` to avoid the DB entirely.

Prefer (1) for confidence and (2) for speed. Layer them: unit tests with mocks,
a smaller e2e suite against a test DB in CI.

## Coverage

```bash
pnpm test:cov   # writes coverage/ and prints a table
```

Aim to cover services (domain logic) first; controllers/resolvers are thin
transport adapters.
