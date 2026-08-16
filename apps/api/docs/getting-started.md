# Getting Started

## Prerequisites

- **Node.js ≥ 20** (22 LTS recommended). The root `package.json` declares
  `engines.node >=18`, but the installed dependencies — Apollo Server 5, Prisma 7,
  NestJS 11 — require Node ≥ 20. Prefer 22 LTS in practice.
- **pnpm ≥ 9** (the repo pins `packageManager: "pnpm@9.0.0"`).
- **PostgreSQL** running locally (or a remote `DATABASE_URL`).
- Optionally the **Nest CLI** for scaffolding modules:

  ```bash
  pnpm add -g @nestjs/cli
  ```

## 1. Install dependencies

From the **repo root**:

```bash
pnpm install
```

This installs every workspace (`apps/*` and `packages/*`) via pnpm + Turborepo.

## 2. Configure environment variables

```bash
cp apps/api/.env.example apps/api/.env
```

At minimum, set:

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

### Environment variables reference

All env vars live in `apps/api/.env` (gitignored). `apps/api/.env.example` is the
committed template.

| Variable                                                                            | Required | Description                                                                                                                                                                                                                                                    |
| ----------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                                      | ✅       | PostgreSQL connection string                                                                                                                                                                                                                                   |
| `BETTER_AUTH_SECRET`                                                                | ✅       | Secret for signing auth tokens (`openssl rand -base64 32`)                                                                                                                                                                                                     |
| `BETTER_AUTH_URL`                                                                   | ✅       | Public URL of the API (`http://localhost:8000`)                                                                                                                                                                                                                |
| `CLIENT_URL`                                                                        | ✅       | Frontend origin (used for CORS + Better Auth `trustedOrigins`)                                                                                                                                                                                                 |
| `PORT`                                                                              | ❌       | API port (default `8000`)                                                                                                                                                                                                                                      |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`                                         | ⚠️       | Google OAuth. `socialProviders.google` is **always registered** in `packages/auth/src/auth.ts` with non-null assertions — if the app fails to boot, set these (or make the provider conditional in code). See [Scalability Roadmap](./scalability-roadmap.md). |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | ❌       | Real SMTP. If `SMTP_HOST` is empty, Better Auth falls back to an **Ethereal test account** and logs preview URLs to the API console (great for dev).                                                                                                           |

## 3. Set up the database

```bash
# From the repo root
pnpm --filter @repo/db db:generate   # generate the Prisma client
pnpm --filter @repo/db db:migrate    # apply migrations (creates tables)
```

> `@repo/db` uses Prisma 7's **driver adapters** (`@prisma/adapter-pg`). The
> generated client is configured in `packages/db/src/index.ts` and exported as
> a singleton `prisma`. The schema lives in `packages/db/prisma/schema.prisma`.
> See [Database (Prisma)](./database.md).

## 4. Run the API

```bash
# From apps/api (dev with watch mode)
pnpm dev

# Or from the repo root (runs all apps via Turborepo)
pnpm --filter api dev
# or
pnpm dev
```

The server starts on `PORT` (default **8000**).

- REST base: `http://localhost:8000/api/...`
- Better Auth base: `http://localhost:8000/api/auth/...`
- GraphQL endpoint: `http://localhost:8000/api/v1/vanijay-real-state`
- GraphQL Playground: enabled in development (`NODE_ENV !== 'production'`)

## Daily development commands

Run these from `apps/api` (or prefix with `pnpm --filter api`):

```bash
pnpm dev          # watch mode (nest start --watch)
pnpm build        # nest build -> dist/
pnpm start:prod   # node dist/main
pnpm lint         # eslint --fix
pnpm format       # prettier --write src & test
pnpm test         # unit tests (jest, *.spec.ts)
pnpm test:e2e     # e2e tests (test/*.e2e-spec.ts)
pnpm test:cov     # coverage
pnpm check-types  # tsc --noEmit (via Turborepo)
```

From the repo root, Turborepo orchestrates everything:

```bash
pnpm dev          # run all apps in parallel
pnpm build        # build all apps + packages (respects ^build deps)
pnpm lint         # lint everything
pnpm check-types  # typecheck everything
```

## Verify it works

```bash
# REST health
curl http://localhost:8000/

# GraphQL introspection (dev only)
curl 'http://localhost:8000/api/v1/vanijay-real-state' \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ __typename }"}'
```

Open the GraphQL Playground in your browser at
`http://localhost:8000/api/v1/vanijay-real-state` (dev only).
