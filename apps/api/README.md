# Real State API — NestJS (REST + GraphQL)

> Production-grade documentation for setting up, extending, and maintaining this
> NestJS API. It serves **both REST and GraphQL** from a single application and
> shares one codebase, one database (Prisma), and one auth layer (Better Auth).
>
> 📖 **Full documentation lives in [`docs/`](./docs/README.md).** This README is a
> quick-start summary; for architecture, conventions, and the scalability roadmap
> see the linked guides. When this README and `docs/` disagree, **`docs/` is
> authoritative** (it reflects the actual current code).

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Prerequisites](#prerequisites)
3. [Project Setup (first time)](#project-setup-first-time)
4. [Environment Variables](#environment-variables)
5. [Daily Development](#daily-development)
6. [Architecture Overview](#architecture-overview)
7. [Project Structure](#project-structure)
8. [Adding a REST Module](#adding-a-rest-module)
9. [Adding a GraphQL Module](#adding-a-graphql-module)
10. [Authentication & Authorization](#authentication--authorization)
11. [Database (Prisma)](#database-prisma)
12. [Validation & Error Handling](#validation--error-handling)
13. [Best Practices for Scalability](#best-practices-for-scalability)
14. [Testing](#testing)
15. [Common Pitfalls](#common-pitfalls)

---

## Tech Stack

| Concern    | Technology                                                           |
| ---------- | -------------------------------------------------------------------- |
| Framework  | NestJS 11 (Express platform)                                         |
| GraphQL    | `@nestjs/graphql` (code-first) + Apollo Server 5                     |
| REST       | Native NestJS controllers                                            |
| ORM        | Prisma 7 (`@prisma/client` + `@prisma/adapter-pg`)                   |
| Auth       | Better Auth (`@repo/auth`) — email/password, email OTP, Google OAuth |
| Validation | `class-validator` + `class-transformer`                              |
| Monorepo   | Turborepo + pnpm workspaces (`apps/*`, `packages/*`)                 |
| Runtime    | Node ≥ 20 (Prisma 7 & Apollo 5 require it)                           |

---

## Prerequisites

- **Node.js ≥ 20** (22 LTS recommended). Note: the root `package.json` still declares `engines.node >=18`, but the installed deps (Apollo Server 5, Prisma 7, NestJS 11) require Node ≥ 20 — prefer 22 LTS in practice.
- **pnpm ≥ 9** (the repo pins `packageManager: "pnpm@9.0.0"`)
- **PostgreSQL** running locally (or a remote `DATABASE_URL`)
- Optionally the **Nest CLI** (`pnpm add -g @nestjs/cli`) — we use it to scaffold modules.

---

## Project Setup (first time)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Create `apps/api/.env` from the template:

```bash
cp apps/api/.env.example apps/api/.env
```

At minimum set:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/real-state"
BETTER_AUTH_SECRET="<generate a secure random secret>"
BETTER_AUTH_URL="http://localhost:8000"
CLIENT_URL="http://localhost:3000"
```

Generate a secret:

```bash
openssl rand -base64 32
```

### 3. Set up the database

```bash
# From the repo root
pnpm --filter @repo/db db:generate   # generate the Prisma client
pnpm --filter @repo/db db:migrate    # apply migrations (creates tables)
```

> `@repo/db` uses Prisma 7's **driver adapters** (`@prisma/adapter-pg`), so the
> generated client is configured in `packages/db/src/index.ts` and exported as
> `prisma`. The schema lives in `packages/db/prisma/schema.prisma`.

### 4. Run the API

```bash
# From apps/api (dev with watch mode)
pnpm dev

# Or from the repo root (runs all apps)
pnpm --filter api dev
```

The server starts on `PORT` (default **8000**).

- REST base: `http://localhost:8000/api/...`
- GraphQL endpoint: `http://localhost:8000/api/v1/vanijay-real-state`
- GraphQL Playground: enabled in development (`playground: true`)

---

## Environment Variables

All env vars live in `apps/api/.env`. Reference table:

| Variable               | Required | Description                                                                                                                                                                                                        |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`         | ✅       | PostgreSQL connection string                                                                                                                                                                                       |
| `BETTER_AUTH_SECRET`   | ✅       | Secret for signing auth tokens (`openssl rand -base64 32`)                                                                                                                                                         |
| `BETTER_AUTH_URL`      | ✅       | Public URL of the API (`http://localhost:8000`)                                                                                                                                                                    |
| `CLIENT_URL`           | ✅       | Frontend origin (used for CORS + trusted origins)                                                                                                                                                                  |
| `PORT`                 | ❌       | API port (default `8000`)                                                                                                                                                                                          |
| `GOOGLE_CLIENT_ID`     | ⚠️       | Google OAuth. Currently `socialProviders.google` is **always registered** in `packages/auth/src/auth.ts` with non-null assertions — if the app fails to boot, set these (or make the provider conditional in code) |
| `GOOGLE_CLIENT_SECRET` | ⚠️       | Google OAuth secret (same caveat as above)                                                                                                                                                                         |
| `SMTP_HOST` / `SMTP_*` | ❌       | Real SMTP. If empty, Better Auth falls back to an **Ethereal test account** and logs preview URLs (great for dev).                                                                                                 |

---

## Daily Development

```bash
pnpm dev            # watch mode
pnpm build          # nest build -> dist/
pnpm start:prod     # node dist/main
pnpm lint           # eslint --fix
pnpm test           # unit tests (jest, *.spec.ts)
pnpm test:e2e       # e2e tests (test/app.e2e-spec.ts)
pnpm test:cov       # coverage
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        apps/api (NestJS)                    │
│                                                             │
│  ┌────────────────────────────┐   ┌───────────────────────┐ │
│  │  REST layer                │   │  GraphQL layer        │ │
│  │  modules/rest/*            │   │  modules/graphql/*    │ │
│  │  Controllers → Services    │   │  Resolvers → Services │ │
│  └──────────┬─────────────────┘   └───────────┬───────────┘ │
│             │          Shared infrastructure │             │
│             └──────────▼──────────────────────┘             │
│        common/ (getRequest, guards, decorators)             │
│        Services call @repo/db (Prisma) & @repo/auth         │
└──────────────────────────────┬──────────────────────────────┘
                               │
              packages/db (Prisma)  •  packages/auth (Better Auth)
```

Key design decisions already in place:

- **One application** serves both REST and GraphQL — no separate servers, no duplicated services.
- **Feature modules** are separated by API style (`modules/rest/*` vs `modules/graphql/*`) but **share services** when the domain is the same (e.g. a `properties` service can be consumed by a REST controller _and_ a GraphQL resolver).
- **Shared request abstraction** — `common/get-request.ts` normalizes access to the underlying Express request for both HTTP and GraphQL contexts, which is what lets guards and decorators work across both layers.
- **Auth is mounted outside Nest** in `main.ts` (Better Auth's node handler) so it receives the **raw body** before Nest's JSON parser runs.

---

## Project Structure

```
apps/api/
├── src/
│   ├── main.ts                        # bootstrap: CORS, Better Auth handler, body parsers
│   ├── app.module.ts                  # root module: GraphQL config + feature modules
│   ├── app.controller.ts              # health check (GET /)
│   ├── common/                        # SHARED, cross-layer code
│   │   ├── get-request.ts             # get Express request from HTTP or GraphQL context
│   │   └── decorators/
│   │       ├── current-user.decorator.ts
│   │       └── roles.decorator.ts
│   └── modules/
│       ├── rest/                      # REST-first feature modules
│       │   └── auth/
│       │       ├── auth.module.ts     # NOTE: currently @Module({}) — the controller below is NOT wired
│       │       ├── auth.controller.ts # LEGACY/UNUSED — actual auth runs via toNodeHandler(auth) in main.ts
│       │       ├── auth.service.ts
│       │       ├── dto/
│       │       ├── entities/
│       │       ├── guards/
│       │       │   ├── auth.guard.ts  # Better Auth session guard (REST)
│       │       │   └── role/
│       │       │       └── role.guard.ts  # works for BOTH REST + GraphQL
│       │       └── permissions/
│       │           └── role.helper.ts
│       └── graphql/                   # GraphQL-first feature modules
│           └── properties/
│               ├── properties.module.ts
│               ├── properties.resolver.ts
│               ├── properties.service.ts
│               ├── dto/               # InputTypes (Create/Update)
│               └── entities/          # ObjectTypes
├── test/
│   ├── jest-e2e.json
│   └── app.e2e-spec.ts
```

### The `common/` folder is your best friend

Anything shared across modules **and** across API styles goes here:

- `getRequest(context)` — used by guards/decorators to fetch the Express request regardless of whether the call came via HTTP or GraphQL.
- `CurrentUser` decorator — reads `request.user` (attached by `AuthGuard`).
- `Roles` decorator + metadata key — marks which roles can access an endpoint.

---

## Adding a REST Module

### 1. Scaffold (optional)

```bash
cd apps/api
npx nest g module modules/rest/<name>
npx nest g controller modules/rest/<name>
npx nest g service modules/rest/<name>
```

### 2. File layout

```
modules/rest/<name>/
├── <name>.module.ts       # @Module({ controllers, providers })
├── <name>.controller.ts   # routes + guards + DTO validation
├── <name>.service.ts      # business logic (talks to prisma)
├── dto/
│   ├── create-<name>.dto.ts
│   └── update-<name>.dto.ts
└── entities/
    └── <name>.entity.ts   # response shape (optional but recommended)
```

### 3. Wire it into the root module

```ts
// src/app.module.ts
import { YourModule } from './modules/rest/your/your.module';

@Module({
  imports: [YourModule /* ... */],
})
export class AppModule {}
```

### 4. Example controller with auth + roles

```ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';

@Controller('api/example')
@UseGuards(AuthGuard, RolesGuard)
export class ExampleController {
  @Get()
  @Roles('AGENCY_AGENT', 'ADMIN')
  findAll(@CurrentUser() user: { id: string }) {
    return { message: `Hello ${user.id}` };
  }
}
```

> **Note:** The `AuthGuard` in `common/guards/auth.guard.ts` **already** uses
> `getRequest(context)` from `common/get-request.ts`, so the same guard works for
> both REST and GraphQL. Apply it with `@UseGuards(AuthGuard)` on either a
> controller or a resolver. See [Auth & RBAC](./docs/auth-and-rbac.md).

---

## Adding a GraphQL Module

The GraphQL layer is **code-first**: you define the schema in TypeScript with
decorators (`@ObjectType`, `@InputType`, `@Resolver`) and Nest generates the SDL.

### 1. Scaffold

```bash
cd apps/api
npx nest g module modules/graphql/<name>
npx nest g resolver modules/graphql/<name>
npx nest g service modules/graphql/<name>
```

### 2. File layout

```
modules/graphql/<name>/
├── <name>.module.ts
├── <name>.resolver.ts   # @Resolver, @Query, @Mutation
├── <name>.service.ts    # shared/domain logic
├── dto/
│   ├── create-<name>.input.ts   # @InputType
│   └── update-<name>.input.ts   # PartialType(Create...Input)
└── entities/
    └── <name>.entity.ts         # @ObjectType
```

### 3. Example — Entity, Input, Resolver

```ts
// entities/property.entity.ts
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Property {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  price?: number;
}
```

```ts
// dto/create-property.input.ts
import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreatePropertyInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  price?: number;
}
```

```ts
// dto/update-property.input.ts
import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { CreatePropertyInput } from './create-property.input';

@InputType()
export class UpdatePropertyInput extends PartialType(CreatePropertyInput) {
  @Field(() => ID)
  id: string;
}
```

```ts
// properties.resolver.ts
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Property } from './entities/property.entity';
import { CreatePropertyInput } from './dto/create-property.input';

@Resolver(() => Property)
export class PropertiesResolver {
  @Query(() => [Property], { name: 'properties' })
  findAll() {
    return [];
  }

  @Mutation(() => Property)
  createProperty(@Args('createPropertyInput') input: CreatePropertyInput) {
    // delegate to a shared service
  }
}
```

### 4. Register in the root module

Same as REST — import the module in `app.module.ts`.

### 5. Config notes (current setup)

```ts
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: true, // ✅ schema generated in-memory (no file to commit)
  playground: process.env.NODE_ENV !== 'production', // ✅ already gated
  path: '/api/v1/vanijay-real-state',
});
```

- `autoSchemaFile: true` keeps the schema ephemeral. For **auditability**, switch
  to `autoSchemaFile: 'src/schema.gql'` and commit the generated SDL — it makes
  schema-diffing in PRs trivial (see [Scalability Roadmap → #14](./docs/scalability-roadmap.md)).
- `playground` is already gated behind `NODE_ENV !== 'production'`.

---

## Authentication & Authorization

Auth uses **Better Auth** (`packages/auth`) with:

- email/password + email OTP verification
- Google OAuth (optional)
- Prisma adapter — users live in the same DB (`User`, `Session`, `Account`, `Verification` tables)

### How auth is mounted (important)

In `main.ts` the app is created with `bodyParser: false`, then:

```ts
const authHandler = toNodeHandler(auth);
app.use('/api/auth', authHandler); // Better Auth must see the RAW body

// after the auth handler, enable JSON parsing for everything else
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

**Order matters.** Better Auth verifies request signatures against the raw body,
so it must run **before** `express.json()` parses/transforms the stream.

### REST guard

`common/guards/auth.guard.ts` resolves the session via `auth.api.getSession()` and
attaches `user` + `session` to the request.

### Making guards work for BOTH REST and GraphQL

Both `AuthGuard` and `RolesGuard` **already** use `common/get-request.ts`, which
switches on `context.getType()` between `'http'` and `'graphql'`, so they work in
both contexts out of the box:

```ts
// common/guards/auth.guard.ts (current code — already context-agnostic)
@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = getRequest(context); // works for HTTP + GraphQL
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session) throw new UnauthorizedException();
    req.user = session.user;
    req.session = session.session;
    return true;
  }
}
```

### Role-based access

```ts
@Roles('ADMIN', 'AGENCY_AGENT')   // decorator from common/decorators/roles.decorator.ts
@UseGuards(AuthGuard, RolesGuard)
```

The `RolesGuard` reads `ROLES_KEY` metadata, normalizes the session user's roles
with `normalizeUserRoles()` (tolerates `user.role` as string or array, and
`user.roles` as array), then checks membership against the required roles.

Valid `UserRole` enum values (`packages/db/prisma/schema.prisma`):
`BUYER`, `SELLER`, `AGENCY_AGENT`, `AGENCY_ADMIN`, `SURVEYOR_AGENT`, `ADMIN`.

---

## Database (Prisma)

- Schema: `packages/db/prisma/schema.prisma`
- Client: exported from `@repo/db` as a **singleton** (`globalForPrisma` prevents
  connection exhaustion in dev/hot-reload).
- Prisma 7 **driver adapter**: `PrismaPg` with `connectionString` from
  `DATABASE_URL` — no separate `DATABASE_URL`-in-schema wiring.

### Migrations workflow

```bash
# 1. Edit schema.prisma
# 2. Generate the client
pnpm --filter @repo/db db:generate

# 3. Create + apply a migration
pnpm --filter @repo/db db:migrate   # prisma migrate dev
```

Use `prisma migrate dev` during development and `prisma migrate deploy` in CI/prod.

### Using Prisma in a service

```ts
import { Injectable } from '@nestjs/common';
import { prisma } from '@repo/db';

@Injectable()
export class PropertiesService {
  async findAll() {
    return prisma.property.findMany();
  }
}
```

> ✅ **Roles are aligned:** `User.role` is `UserRole[]` in the Prisma schema and
> Better Auth's `additionalFields` now stores `role` as `type: "string[]"` with
> `defaultValue: ["BUYER"]`, matching the column type. The `RolesGuard`
> normalizes via `normalizeUserRoles()` in
> `common/utils/role.helper.ts`, so it tolerates both `user.role`
> (string or array) and `user.roles` (array) — including legacy single-string rows.

---

## Validation & Error Handling

- DTOs/Inputs are validated with **class-validator** + **class-transformer**
  (already in `package.json`).
- Global validation is **already enabled** in `main.ts`:

```ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // strip unknown properties
    forbidNonWhitelisted: true, // reject unknown properties in strict APIs
    transform: true, // auto-transform DTO instances
  }),
);
```

> 📈 For better testability, move this to an `APP_PIPE` provider so it's part
> of the Nest DI context. See [Scalability Roadmap → #2](./docs/scalability-roadmap.md).

- For REST responses, define `entities/*` and return them explicitly instead of
  leaking raw Prisma rows.
- Create a **global exception filter** (`common/filters/global-exception.filter.ts`)
  for consistent error JSON across REST **and** GraphQL, and log every unhandled
  error.

---

## Best Practices for Scalability

### Structure & modules

1. **One module = one feature.** Keep REST and GraphQL in their own folders
   (`modules/rest/<feature>`, `modules/graphql/<feature>`), but **share services**
   when the domain overlaps.
2. **Move shared business logic into `@repo/` packages** when it's used by more
   than the API (e.g. domain types, validation schemas, pricing logic).
3. **Keep `common/` for infrastructure only** — never import feature code there.
4. **Register modules in a `AppModule` that stays thin** — consider a
   `CoreModule`/`SharedModule` for global providers (logger, prisma, config).

### API design

5. **Version the REST API** (`/api/v1/...`) and keep GraphQL evolving safely via
   deprecation flags (`@deprecated` reason) instead of breaking changes.
6. **Pagination everywhere.** For REST use `@nestjs/paginate` or cursor
   pagination; for GraphQL return `Connection` types (Relay-style) or a
   `PaginationResult` ObjectType (items + total + page).
7. **Never return the full entity for list endpoints** — select only needed
   fields (`select`/`include` in Prisma) and map to response DTOs.
8. **Use Prisma transactions** (`prisma.$transaction`) for multi-step mutations.

### Performance & reliability

9. **Enable `sortSchema` / `introspection` off in prod**, and disable playground
   in production.
10. **Rate limiting** on the REST layer (`@nestjs/throttler`) and complexity
    limiting on GraphQL to prevent expensive queries.
11. **Logging:** enable Nest built-in logger; send structured logs (JSON) to
    stdout and let the platform (Docker/ECS/Cloud Run) collect them.
12. **Caching** for read-heavy queries (Redis via `@nestjs/cache-manager`).

### Security

13. Never log secrets or full user PII.
14. Keep `ValidationPipe` strict (`whitelist + forbidNonWhitelisted`).
15. Enforce roles at the **guard level**, not just in the controller body.
16. `helmet` (via `app.use(helmet())`) in production.

---

## Testing

- **Unit tests** (`*.spec.ts`) — use `Test.createTestingModule` with mocked
  services/prisma. Test resolvers + controllers in isolation.
- **E2e tests** (`test/*.e2e-spec.ts`) — boot the whole `AppModule`, hit both
  REST routes and GraphQL mutations/queries with `supertest`.

```bash
pnpm test        # unit
pnpm test:e2e    # e2e
pnpm test:cov    # coverage
```

Example GraphQL e2e snippet:

```ts
it('creates a property via GraphQL', () => {
  return request(app.getHttpServer())
    .post('/api/v1/vanijay-real-state')
    .send({
      query: `mutation { createProperty(createPropertyInput: { title: "House" }) { id title } }`,
    })
    .expect(200);
});
```

---

## Common Pitfalls

| Pitfall                                       | Fix                                                                                                                                                          |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `body missing` errors in GraphQL/REST         | `express.json()` must run after the Better Auth handler; keep `bodyParser: false` + manual `express.json()` (current `main.ts` already does this correctly). |
| `AuthGuard` doesn't work on GraphQL resolvers | Use a guard that calls `getRequest(context)` (see [Authentication](#authentication--authorization)).                                                         |
| Playground/SDL in production                  | Gate `playground` on `NODE_ENV`, disable introspection in prod.                                                                                              |
| `UserRole[]` vs Better Auth `role` mismatch   | Already aligned: `additionalFields` uses `type: "string[]"`; `RolesGuard` normalizes both shapes via `normalizeUserRoles()`.                                 |
| Prisma client recreated on hot-reload         | Always import the singleton from `@repo/db` (already handled via `globalForPrisma`).                                                                         |
| GraphQL schema changes not visible in git     | Switch `autoSchemaFile` to a committed `.gql` file for PR review.                                                                                            |
| `class-validator` decorators ignored          | Ensure `ValidationPipe({ transform: true })` is registered.                                                                                                  |

---

## Deploying

1. Build: `pnpm --filter api build`
2. Set env vars (all from [Environment Variables](#environment-variables)).
3. Run migrations with the **non-interactive** command (don't use `db:migrate` here — it maps to `prisma migrate dev`):

   ```bash
   pnpm --filter @repo/db exec prisma migrate deploy
   ```

4. Start: `node apps/api/dist/main.js`

For containers, a `Dockerfile` in `apps/api/` that runs the build, applies
migrations, and starts the server is the recommended path.
