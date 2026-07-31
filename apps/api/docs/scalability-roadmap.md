# Scalability & Maintainability Roadmap

> ⭐ This is the core guide the docs were created for: how to evolve the current
> API toward the most scalable, maintainable NestJS architecture — serving both
> REST and GraphQL.

The current code is a solid foundation: one app, two transports, shared
`common/` helpers, Better Auth, Prisma. The items below close the gaps to a
production-grade, team-friendly codebase. They are ordered roughly by
impact/effort; each is self-contained so you can adopt them incrementally.

**At-a-glance checklist**

- [ ] 1. `ConfigModule` (`@nestjs/config`) with Zod validation
- [x] 2. Move cross-cutting globals to `APP_*` providers (DI/testable)
- [x] 3. Global exception filter (consistent REST + GraphQL errors)
- [x] 4. Request logging + structured logging (`nestjs-pino`)
- [x] 5. `@nestjs/throttler` rate limiting (REST + GraphQL)
- [x] 6. `helmet` security headers
- [x] 7. `PrismaService` + `PrismaModule` (injectable, mockable)
- [ ] 8. Shared domain services (one service per domain, both transports)
- [ ] 9. Response DTOs/mappers (never leak raw Prisma rows)
- [ ] 10. Pagination (cursor for GraphQL, page/cursor for REST)
- [x] 11. GraphQL complexity & depth limiting
- [ ] 12. `@nestjs/swagger` OpenAPI for REST
- [x] 13. Healthchecks (`@nestjs/terminus`) for k8s/Docker
- [x] 14. Commit generated SDL (`autoSchemaFile: 'src/schema.gql'`)
- [ ] 15. Auth hardening (conditional Google OAuth, cookie flags)
- [ ] 16. CI/CD pipeline (lint, typecheck, test, build, migrate deploy)
- [ ] 17. Docker multi-stage build
- [ ] 18. Cleanup dead scaffolding (`AuthController`/`AuthService`)

---

## 1. ConfigModule — typed, validated config

Today `process.env.*` is read ad-hoc across `main.ts`, `app.module.ts`,
`packages/auth`, and `packages/db`. Centralize it.

```bash
pnpm --filter api add @nestjs/config zod
```

```ts
// src/config/config.ts
import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(8000),
  CLIENT_URL: z.string().url(),
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(16),
  BETTER_AUTH_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  SMTP_HOST: z.string().optional(),
});
export type Env = z.infer<typeof envSchema>;
```

```ts
// src/config/configuration.ts
import { envSchema } from './config';
export default () => envSchema.parse(process.env);
```

```ts
// src/app.module.ts
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    // ...
  ],
})
```

Inject `ConfigService` instead of reading `process.env` directly. Validate at
boot — `zod.parse` fails fast with a clear message if a var is missing.

## 2. Move cross-cutting globals to `APP_*` providers

`main.ts` registers `ValidationPipe` via `app.useGlobalPipes(...)`. This works
but **cannot be injected/mocked** in tests and bypasses DI. Prefer `APP_*`
providers in a module so they're part of the Nest context:


## 3. Global exception filter — consistent errors for REST + GraphQL

Nest's default error shape differs between REST (HTTP exceptions → JSON) and
GraphQL (`ApolloError` → `errors[]`). Normalize both:

```ts
// src/common/filters/global-exception.filter.ts
import { Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    this.logger.error(exception instanceof Error ? exception.stack : String(exception));

    // GraphQL: rethrow so Apollo packages it into errors[] uniformly
    if (host.getType<'http' | 'graphql'>() === 'graphql') {
      throw exception instanceof Error ? exception : new Error(String(exception));
    }

    // REST: respond with a consistent JSON shape
    const res = host.switchToHttp().getResponse();
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error';
    res.status(status).json({ statusCode: status, message });
  }
}
```

This gives a single place to log every unhandled error and shape errors for
clients (strip stack traces in prod, add stable error codes).

## 4. Request logging + structured logging

Replace Nest's default logger with **pino** for JSON logs to stdout (container
friendly, parseable by log aggregators):

```bash
pnpm --filter api add nestjs-pino pino-http pino-pretty
```

```ts
// src/main.ts
import { Logger as PinoLogger } from 'nestjs-pino';

const app = await NestFactory.create(AppModule, { bodyParser: false, bufferLogs: true });
app.useLogger(app.get(PinoLogger));
```

Add a `LoggingInterceptor` (registered via `APP_INTERCEPTOR`) to log method,
route, duration, and status. **Never** log secrets or full PII (sessions,
tokens, `SMTP_PASS`).

## 5. `@nestjs/throttler` rate limiting (REST + GraphQL)

```bash
pnpm --filter api add @nestjs/throttler @nestjs/throttler-storage-redis
```

```ts
// src/app.module.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    // ...
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
```

`ThrottlerGuard` works for REST out of the box. For GraphQL, subclass it and
override `getTracker()` / `generateKey()` using `getRequest(context)` from
`common/get-request.ts` so the same guard rate-limits both transports.

## 6. `helmet` security headers

```bash
pnpm --filter api add helmet
```

```ts
// src/main.ts  (after NestFactory.create, before app.use(express.json()))
import helmet from 'helmet';
app.use(helmet());
```

Set HSTS, CSP, and other safe defaults. Combine with the existing CORS config.
```ts
// src/common/common.module.ts
import { Module } from '@nestjs/common';
import { APP_PIPE, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

@Module({
  providers: [
    { provide: APP_PIPE, useValue: new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }) },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class CommonModule {}
```

Import `CommonModule` once in `AppModule`. In e2e tests the test app now gets the
same globals automatically (no need to re-register them manually).


## 7. Prisma as an injectable service

Today services `import { prisma } from '@repo/db'`. That works but bypasses DI
and is awkward to mock. Add a thin `PrismaService` + `PrismaModule` in the API:

```ts
// src/modules/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@repo/db';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() { await this.$connect(); }

  async enableShutdownHooks(app: import('@nestjs/core').INestApplication) {
    process.on('beforeExit', async () => { await this.$disconnect(); await app.close(); });
  }
}
```

```ts
// src/modules/prisma/prisma.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({ providers: [PrismaService], exports: [PrismaService] })
export class PrismaModule {}
```

Then inject it in services (`constructor(private prisma: PrismaService)`) and
use `this.prisma.property.findMany(...)`. In tests, override the `PrismaService`
provider with a mock object. Enable shutdown hooks in `main.ts`:
`app.enableShutdownHooks()`.

> `@repo/db` can keep exporting the singleton `prisma` for `packages/auth`
> (which lives outside Nest). The API itself should use `PrismaService` via DI.

## 8. Shared domain services (the golden rule)

A domain should have **one** service backing both transports. Concretely, a
`PropertiesService` consumed by both `PropertiesController` (REST) and
`PropertiesResolver` (GraphQL). See [Module Conventions](./module-conventions.md)
for the full pattern. Benefits:

- One place for business rules, authorization checks, and side effects.
- No drift between REST and GraphQL behavior.
- Trivially testable (mock one service).

For cross-cutting mutations across multiple Prisma models, use transactions:

```ts
await this.prisma.$transaction(async (tx) => {
  const property = await tx.property.create({ data: { /* ... */ } });
  await tx.propertyViewLog.create({ data: { propertyId: property.id, /* ... */ } });
  return property;
});
```

## 9. Response DTOs/mappers — never leak raw Prisma rows

Returning `prisma.property.findMany()` directly leaks the table shape. Define
response DTOs/entities and map:

```ts
// entities/property.entity.ts (GraphQL @ObjectType, also REST shape)
@ObjectType()
export class Property {
  @Field(() => ID) id: string;
  @Field() title: string;
  @Field(() => Number, { nullable: true }) price?: number;
}

// service maps to it
async findAll() {
  const rows = await this.prisma.property.findMany();
  return rows.map((r) => plainToInstance(Property, r)); // or a manual mapper
}
```

For list endpoints, select only needed fields (`select`/`include`) to reduce
payload and N+1 risk.

## 10. Pagination

**REST:** return `{ items, total, page, pageSize }` (offset) or a cursor token
(preferred for large/real-time tables).

**GraphQL:** return a `Connection`-style type (Relay) or a simple
`PaginatedProperty`:

```ts
@ObjectType()
class PaginatedProperty {
  @Field(() => [Property]) items: Property[];
  @Field(() => Int) total: number;
  @Field(() => String, { nullable: true }) nextCursor?: string | null;
}

@Query(() => PaginatedProperty)
async properties(@Args('cursor', { nullable: true }) cursor?: string) {
  return this.propertiesService.findPaginated(cursor);
}
```

Use Prisma `cursor`/`take` pagination (`findMany({ take: N, skip: cursor ? 1 : 0,
cursor: { id: cursor } })`).

## 11. GraphQL complexity & depth limiting

Prevent malicious/expensive queries. Apollo exposes `validationRules`:

```ts
import depthLimit from 'graphql-depth-limit';
import { createComplexityRule } from 'graphql-query-complexity';

GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: 'src/schema.gql',
  playground: process.env.NODE_ENV !== 'production',
  path: '/api/v1/vanijay-real-state',
  validationRules: [depthLimit(7), createComplexityRule({ maximumComplexity: 1000 })],
}),
```

```bash
pnpm --filter api add graphql-depth-limit graphql-query-complexity
```

## 12. `@nestjs/swagger` OpenAPI for REST

Document REST automatically so the Next.js client and external integrators have
typed clients:

```bash
pnpm --filter api add @nestjs/swagger
```

```ts
// src/main.ts
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Real State API')
  .setDescription('REST + GraphQL')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document, {
  swaggerOptions: { persistAuthorization: true },
});
```

Annotate DTOs with `@ApiProperty()` and controllers with `@ApiTags()`. Gate the
docs route behind `NODE_ENV !== 'production'` if desired.

## 13. Healthchecks (`@nestjs/terminus`)

For k8s liveness/readiness probes and Docker health:

```bash
pnpm --filter api add @nestjs/terminus @nestjs/axios axios
```

```ts
@Controller('health')
export class HealthController {
  constructor(private health: HealthCheckService) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([async () => {
      await this.prisma.$queryRaw`SELECT 1`;
      return { prisma: { status: 'up' } };
    }]);
  }
}
```

## 14. Commit the generated SDL

Switch `autoSchemaFile: true` → `autoSchemaFile: 'src/schema.gql'` so the schema
is written to a committed file. Now every resolver/ObjectType change produces a
reviewable schema diff in PRs. The file is regenerated on each build.

## 15. Auth hardening

- **Conditional Google OAuth:** only register `socialProviders.google` when
  `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` are set, so missing creds don't
  crash the app:

  ```ts
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? { google: { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET } }
      : {}),
  },
  ```

- **Cookie flags:** ensure Better Auth sets `secure`, `sameSite`, and
  `httpOnly` appropriately for production (`BETTER_AUTH_URL` over HTTPS).
- Remove the stray empty `import { } from '@repo/auth';` in `auth.controller.ts`.

## 16. CI/CD pipeline

A GitHub Actions job (per app) that runs in order:

1. `pnpm install --frozen-lockfile`
2. `pnpm --filter @repo/db db:generate`
3. `pnpm lint`
4. `pnpm check-types`
5. `pnpm test` (unit) and `pnpm test:e2e` (against a test DB)
6. `pnpm build`
7. On deploy: `pnpm --filter @repo/db exec prisma migrate deploy`
8. Start: `node apps/api/dist/main.js`

Turborepo already wires `build`/`lint`/`check-types`/`dev` tasks; mirror them in
CI with caching (`actions/cache` on `node_modules` + Turbo remote cache).

## 17. Docker multi-stage build

A `Dockerfile` in `apps/api/`:

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY packages/db/package.json packages/db/
COPY packages/auth/package.json packages/auth/
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @repo/db db:generate
RUN pnpm --filter api build

FROM node:22-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/package.json ./package.json
EXPOSE 8000
CMD ["node", "dist/main.js"]
```

Run migrations as an entrypoint step (`prisma migrate deploy`) before the app, or
as a separate init container.

## 18. Cleanup dead scaffolding

- Decide on auth wiring: keep the `app.use('/api/auth', authHandler)` middleware
  (recommended) **and** delete `auth.controller.ts`, `auth.service.ts`, and the
  placeholder `dto/`/`entities/` under `modules/rest/auth/` — or, if you prefer
  a controller, wire `AuthController` into `AuthModule` and remove the middleware.
  Don't leave both.
- Remove the empty `import { } from '@repo/auth';` in `auth.controller.ts`.
- Convert the placeholder `modules/graphql/properties` to a real shared module
  (see [Module Conventions → 6](./module-conventions.md)).

---

## Summary: the target architecture

```
main.ts → NestFactory.create(AppModule, { bodyParser:false, bufferLogs:true })
          helmet() → CORS → Better Auth middleware → express.json() → listen
AppModule
 ├─ ConfigModule (global, validated)                              ← #1
 ├─ GraphQLModule (code-first, complexity-limited, committed SDL) ← #11 #14
 ├─ CommonModule (APP_PIPE / APP_FILTER / APP_INTERCEPTOR / APP_GUARD) ← #2 #3 #4 #5
 ├─ ThrottlerModule + ThrottlerGuard (APP_GUARD)                  ← #5
 ├─ PrismaModule (PrismaService via DI)                          ← #7
 ├─ Swagger setup                                                 ← #12
 └─ Feature modules (properties, listings, inquiries, …)
     └─ ONE shared DomainService → controller (REST) + resolver (GraphQL) ← #8
        └─ PrismaService + transactions + mappers + pagination    ← #9 #10
```

Adopt incrementally; keep `pnpm test` green at each step.