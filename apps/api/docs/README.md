# Real State API — Documentation

> Authoritative docs for the NestJS API that serves **both REST and GraphQL**
> from a single application. It shares one codebase, one database (Prisma), and
> one auth layer (Better Auth).

This `docs/` folder is the source of truth for setup, architecture, conventions,
and the roadmap to a maximally scalable & maintainable codebase. The legacy
`apps/api/README.md` is kept as a quick-start summary; when they disagree,
**these docs reflect the actual code**.

---

## 📚 Table of Contents

| Doc                                             | What it covers                                                                                                                                                                                                                   |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Getting Started](./getting-started.md)         | Prerequisites, install, env vars, running the API, daily commands                                                                                                                                                                |
| [Architecture](./architecture.md)               | How REST + GraphQL coexist, layering, the `common/` folder, module boundaries                                                                                                                                                    |
| [Module Conventions](./module-conventions.md)   | Step-by-step patterns for adding REST controllers **and** GraphQL resolvers, with full working examples                                                                                                                          |
| [Auth & RBAC](./auth-and-rbac.md)               | Better Auth mounting order, `AuthGuard`, `RolesGuard`, `@CurrentUser`, `@Roles`, the `UserRole` enum                                                                                                                             |
| [Database (Prisma)](./database.md)              | Singleton client, driver adapter, migrations, using Prisma in services                                                                                                                                                           |
| [Scalability Roadmap](./scalability-roadmap.md) | ⭐ The improvement plan for the most scalable/maintainable architecture (ConfigModule, global filters/interceptors, throttler, helmet, Swagger, shared domain services, pagination, complexity limiting, testing, CI/CD, Docker) |
| [Testing](./testing.md)                         | Unit (`*.spec.ts`) and e2e (`*.e2e-spec.ts`) patterns for REST + GraphQL                                                                                                                                                         |
| [Troubleshooting](./troubleshooting.md)         | Common pitfalls and their fixes                                                                                                                                                                                                  |

---

## Quick orientation

```
apps/api/
├── src/
│   ├── main.ts                       # bootstrap: pipes, CORS, Better Auth mount, JSON body
│   ├── app.module.ts                 # GraphQLModule + feature modules
│   ├── app.controller.ts / .service.ts
│   ├── common/                       # shared across REST + GraphQL
│   │   ├── get-request.ts            # resolve Express req from http OR graphql context
│   │   └── decorators/               # @CurrentUser, @Roles
│   └── modules/
│       ├── rest/auth/                # Better Auth guards + RBAC helpers
│       └── graphql/properties/       # code-first GraphQL (placeholder)
├── test/                             # e2e specs
└── docs/                             # ← you are here
```

## Tech stack at a glance

| Concern    | Technology                                                           |
| ---------- | -------------------------------------------------------------------- |
| Framework  | NestJS 11 (Express platform)                                         |
| GraphQL    | `@nestjs/graphql` (code-first) + Apollo Server 5                     |
| REST       | Native NestJS controllers                                            |
| ORM        | Prisma 7 (`@prisma/client` + `@prisma/adapter-pg`)                   |
| Auth       | Better Auth (`@repo/auth`) — email/password, email OTP, Google OAuth |
| Validation | `class-validator` + `class-transformer`                              |
| Monorepo   | Turborepo + pnpm workspaces (`apps/*`, `packages/*`)                 |
| Runtime    | Node ≥ 20 (22 LTS recommended)                                       |
