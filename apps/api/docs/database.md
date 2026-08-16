# Database (Prisma)

The database layer lives in the shared workspace package `packages/db`
(package name `@repo/db`), so both the API and any other workspace can consume
the same singleton Prisma client.

## Where things live

| File                               | Purpose                                                       |
| ---------------------------------- | ------------------------------------------------------------- |
| `packages/db/prisma/schema.prisma` | The Prisma schema (models, enums, relations)                  |
| `packages/db/src/index.ts`         | Singleton `prisma` client + re-exports `@prisma/client` types |
| `packages/db/src/client.ts`        | Alternate client entry (same singleton pattern)               |
| `packages/db/prisma/migrations/`   | Applied migrations                                            |
| `packages/db/prisma.config.ts`     | Prisma CLI config                                             |

## The singleton client

`packages/db/src/index.ts` creates a single `PrismaClient` and caches it on
`globalThis` to prevent connection exhaustion during hot-reload in development:

```ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export * from '@prisma/client'; // re-export enums like UserRole, types, etc.
```

- Prisma 7 **driver adapter**: `PrismaPg` takes the `connectionString` from
  `DATABASE_URL` — the schema's `datasource` only sets `provider = "postgresql"`.
- The `UserRole` enum (and all other enums) is re-exported, which is why
  `@Roles(...)` and `RolesGuard` import `UserRole` from `@repo/db`.

## Migrations workflow

```bash
# 1. Edit packages/db/prisma/schema.prisma
# 2. Generate the client (updates node_modules/@prisma/client)
pnpm --filter @repo/db db:generate

# 3. Create + apply a migration (prisma migrate dev)
pnpm --filter @repo/db db:migrate
```

In CI/production use the **non-interactive** deploy command (do **not** use
`db:migrate` there — it maps to `prisma migrate dev`, which is interactive):

```bash
pnpm --filter @repo/db exec prisma migrate deploy
```

## Using Prisma in a service (current pattern)

Today, services import the singleton directly:

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

> ⚠️ **Scalability note:** importing the singleton directly works but is hard to
> mock in unit tests and bypasses Nest's DI/lifecycle. The recommended upgrade
> is a `PrismaService` + `PrismaModule` so Prisma is injected and can be mocked.
> See [Scalability Roadmap → Prisma as an injectable service](./scalability-roadmap.md#7-prisma-as-an-injectable-service).

## Schema highlights

The schema models a Nepal real-estate archive. Key enums relevant to the API:

- `UserRole` → `BUYER`, `SELLER`, `AGENCY_AGENT`, `AGENCY_ADMIN`,
  `SURVEYOR_AGENT`, `ADMIN` (used by RBAC).
- `User.role` is `UserRole[] @default([BUYER])` — a user can hold multiple
  roles. Better Auth's `additionalFields` stores `role` as `type: "string[]"`
  with `defaultValue: ["BUYER"]`, matching the column type.
- Other domain enums: `VerificationStatus`, `PropertyStatus`, `PropertyType`,
  `FacingDirection`, `RoadType`, `DocumentType`, `DocumentStatus`, `MediaType`,
  `InquiryType`, `InquiryStatus`, `AlertFrequency`, `NotificationType`,
  `AppointmentStatus`, `QuestionCategory`.

## Roles are aligned end-to-end

- **Prisma:** `User.role` is `UserRole[]`.
- **Better Auth:** `additionalFields.role` is `type: "string[]"`,
  `defaultValue: ["BUYER"]`.
- **API:** `RolesGuard` reads `ROLES_KEY` metadata and normalizes the session
  user's roles via `normalizeUserRoles()` in
  `common/utils/role.helper.ts`, which tolerates `user.role`
  as a string or array **and** `user.roles` as an array (handles legacy
  single-string rows). See [Auth & RBAC](./auth-and-rbac.md).
