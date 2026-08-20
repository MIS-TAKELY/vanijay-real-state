# Architecture

## One application, two API styles

This NestJS app serves **both REST and GraphQL** from a single process. There is
no separate server, no duplicated business logic, and one shared auth/database
layer.

```
┌──────────────────────────────────────────────────────────────────┐
│                         apps/api (NestJS)                         │
│                                                                   │
│  ┌──────────────────────────────┐   ┌───────────────────────────┐ │
│  │  REST layer                  │   │  GraphQL layer             │ │
│  │  modules/rest/*             │   │  modules/graphql/*         │ │
│  │  Controllers → Services      │   │  Resolvers → Services      │ │
│  └──────────┬───────────────────┘   └───────────┬───────────────┘ │
│             │      Shared infrastructure          │                │
│             └────────────────▼───────────────────┘                │
│                 common/ (getRequest, guards, decorators)           │
│                 Services call @repo/db (Prisma) & @repo/auth       │
└────────────────────────────────────┬──────────────────────────────┘
                                     │
            packages/db (Prisma)  •  packages/auth (Better Auth)
```

### Key design decisions (already in place)

1. **One application** serves both REST and GraphQL — no separate servers, no
   duplicated services.
2. **Feature modules are separated by API style** (`modules/rest/*` vs
   `modules/graphql/*`) but **should share services** when the domain is the
   same (e.g. a `properties` service consumed by both a REST controller and a
   GraphQL resolver). The current `properties` module is a placeholder — see
   [Module Conventions](./module-conventions.md) for the recommended pattern.
3. **Auth is mounted once** as middleware (`app.use('/api/auth', ...)`) — see
   [Auth & RBAC](./auth-and-rbac.md) for why it is **not** a Nest controller.
4. **Guards/decorators are context-agnostic** via `common/get-request.ts`, so
   the same `AuthGuard`/`RolesGuard`/`@CurrentUser` work for REST **and** GraphQL.

## Bootstrapping (`src/main.ts`)

The bootstrap is intentionally explicit about middleware ordering because
Better Auth must read the **raw** request body:

```ts
const app = await NestFactory.create(AppModule, { bodyParser: false });

// 1) Global validation (REST DTOs + GraphQL inputs via the pipe)
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // strip unknown properties
    forbidNonWhitelisted: true, // reject unknown properties
    transform: true, // auto-transform DTO instances
  }),
);

// 2) CORS
app.enableCors({
  origin: process.env.CLIENT_URL ?? 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// 3) Better Auth sees the RAW body (must come before express.json())
const authHandler = toNodeHandler(auth);
app.use('/api/auth', authHandler);

// 4) Body parsing for everything else (REST + GraphQL)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

await app.listen(process.env.PORT ?? 8000);
```

> ⚠️ **Order matters.** Better Auth verifies request signatures against the raw
> body stream, so it must run **before** `express.json()` consumes the stream.
> Keeping `bodyParser: false` + manual `express.json()` is what makes both
> Better Auth and GraphQL/REST body parsing coexist.

## The root module (`src/app.module.ts`)

```ts
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true, // ephemeral schema
      playground: process.env.NODE_ENV !== 'production', // gated ✅
      path: '/api/v1/malpoth',
    }),
    AuthModule,
    PropertiesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

- GraphQL is **code-first**: you write `@ObjectType`/`@InputType`/`@Resolver`
  in TypeScript and Nest generates the SDL in memory (`autoSchemaFile: true`).
- `playground` is already gated on `NODE_ENV !== 'production'`.
- The GraphQL endpoint is `/api/v1/malpoth`.

> 📌 For auditability, consider switching `autoSchemaFile: true` to a committed
> file like `autoSchemaFile: 'src/schema.gql'` so schema diffs show up in PRs.
> See [Scalability Roadmap](./scalability-roadmap.md).

## Project structure

```
apps/api/
├── src/
│   ├── main.ts                        # bootstrap
│   ├── app.module.ts                  # root module (GraphQLModule + features)
│   ├── app.controller.ts              # GET / health
│   ├── app.service.ts
│   ├── common/                        # shared across REST + GraphQL
│   │   ├── get-request.ts             # resolve req from http | graphql context
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts   # @CurrentUser
│   │   │   └── roles.decorator.ts          # @Roles(...) + ROLES_KEY
│   │   ├── guards/
│   │   │   ├── auth.guard.ts               # session → req.user (http + graphql)
│   │   │   ├── role.guard.ts               # RBAC via Reflector + metadata
│   │   │   └── gql-throttler.guard.ts      # rate limiting (REST + GraphQL)
│   │   └── utils/
│   │       └── role.helper.ts              # normalizeUserRoles, hasRole, hasAllRoles
│   └── modules/
│       ├── rest/
│       │   └── auth/
│       │       ├── auth.module.ts             # currently empty @Module({})
│       │       ├── auth.controller.ts         # ⚠️ scaffolding, NOT wired (see auth docs)
│       │       ├── auth.service.ts            # ⚠️ stub CRUD, NOT wired
│       │       └── dto/ + entities/           # auth feature DTOs/entities
│       └── graphql/
│           └── properties/                    # code-first GraphQL (placeholder)
│               ├── properties.module.ts
│               ├── properties.resolver.ts
│               ├── properties.service.ts
│               ├── dto/create-property.input.ts
│               ├── dto/update-property.input.ts
│               └── entities/property.entity.ts
├── test/
│   ├── jest-e2e.json
│   └── app.e2e-spec.ts
├── docs/                             # ← this folder
└── ...config (nest-cli.json, tsconfig*.json, eslint.config.mjs, .prettierrc)
```

## The `common/` folder is your best friend

Anything shared across modules **and** across API styles goes here. Today it
contains three high-leverage utilities:

### `common/get-request.ts` — context-agnostic request resolution

```ts
export function getRequest(context: ExecutionContext) {
  switch (context.getType<'http' | 'graphql'>()) {
    case 'http':
      return context.switchToHttp().getRequest();
    case 'graphql':
      return GqlExecutionContext.create(context).getContext().req;
    default:
      throw new Error(`Unsupported context: ${context.getType()}`);
  }
}
```

This is the single reason guards/decorators work for **both** REST and GraphQL
without duplication. Every cross-context guard should call `getRequest(context)`.

### `common/decorators/current-user.decorator.ts` — `@CurrentUser`

```ts
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = getRequest(ctx);
    return data ? request.user?.[data] : request.user;
  },
);
```

Reads `request.user` (attached by `AuthGuard`). Supports `@CurrentUser('id')`
to pluck a single field.

### `common/decorators/roles.decorator.ts` — `@Roles`

```ts
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

Sets metadata that `RolesGuard` reads via `Reflector`.

## Module boundaries (the scalable rule)

- **Controllers/Resolvers** = transport adapters. They parse input, apply
  guards/decorators, and call a service. No business logic here.
- **Services** = the domain. Business rules live here, and they talk to Prisma.
- **A domain service should be reusable** across transport: one
  `PropertiesService` should back both `PropertiesController` (REST) and
  `PropertiesResolver` (GraphQL). The current `properties` folder only has the
  GraphQL resolver; the scalable pattern adds a shared service consumed by both.
  See [Module Conventions](./module-conventions.md).

## Cross-cutting concerns (current vs. recommended)

| Concern          | Current state                           | Recommended                                           |
| ---------------- | --------------------------------------- | ----------------------------------------------------- |
| Validation       | ✅ Global `ValidationPipe` in `main.ts` | Move to `APP_PIPE` for DI/testability                 |
| Error handling   | ❌ No global exception filter           | Add `APP_FILTER` for consistent REST + GraphQL errors |
| Logging          | Nest default logger                     | Structured JSON logging (`nestjs-pino`)               |
| Rate limiting    | ❌ None                                 | `@nestjs/throttler` (REST + GraphQL guard)            |
| Security headers | ❌ None                                 | `helmet` in `main.ts`                                 |
| Config           | `process.env.*` scattered               | `@nestjs/config` with validation                      |
| Prisma access    | Singleton import                        | `PrismaService` + DI (mockable)                       |

See the [Scalability Roadmap](./scalability-roadmap.md) for concrete steps.
