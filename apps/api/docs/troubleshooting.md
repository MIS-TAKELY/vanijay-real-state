# Troubleshooting

Common pitfalls and their fixes, grounded in the current codebase.

| Pitfall                                                      | Fix                                                                                                                                                                                                    |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `body missing` errors in GraphQL/REST after Better Auth runs | Keep `bodyParser: false` + `app.use('/api/auth', authHandler)` **before** `app.use(express.json())`. The current `main.ts` already does this correctly — don't reorder.                                |
| `AuthGuard` doesn't protect a GraphQL resolver               | It does today — `auth.guard.ts` uses `getRequest(context)` which handles `graphql` context. Apply it with `@UseGuards(AuthGuard)` on the resolver/class.                                               |
| Playground/SDL exposed in production                         | Already gated: `playground: process.env.NODE_ENV !== 'production'`. For extra safety, disable introspection in prod via Apollo `buildSubgraphServer`/`introspection: false`.                           |
| `UserRole[]` vs Better Auth `role` mismatch                  | Aligned: Prisma `User.role` is `UserRole[]`; Better Auth `additionalFields.role` is `type: "string[]"` with `defaultValue: ["BUYER"]`. `RolesGuard` normalizes both shapes via `normalizeUserRoles()`. |
| Prisma client recreated on hot-reload                        | Always import the singleton from `@repo/db` (`globalForPrisma` caches it). Don't `new PrismaClient()` in feature modules.                                                                              |
| GraphQL schema changes not visible in git                    | `autoSchemaFile: true` is ephemeral. Switch to `autoSchemaFile: 'src/schema.gql'` and commit the SDL so diffs appear in PRs.                                                                           |
| `class-validator` decorators ignored                         | The global `ValidationPipe({ transform: true })` is registered in `main.ts`. For e2e tests you must register it manually on the test app (Nest doesn't apply `main.ts` globals in the testing module). |
| Google OAuth crash on boot                                   | `socialProviders.google` is registered with `!` non-null assertions. Set `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`, or make the provider conditional in `packages/auth/src/auth.ts`.                   |
| Ethereal emails not arriving                                 | When `SMTP_HOST` is unset, Better Auth uses an Ethereal test account and logs the preview URL to the API console — check stdout. Set real `SMTP_*` for delivery.                                       |
| `@repo/auth` / `@repo/db` not found after pulling            | Build the workspace packages: `pnpm --filter @repo/db build` and `pnpm --filter @repo/auth build`, or `pnpm build` from root (Turborepo respects `^build`).                                            |
| Changes to `packages/db` not reflected                       | Re-run `pnpm --filter @repo/db db:generate` after editing `schema.prisma`, then rebuild `@repo/db`.                                                                                                    |
| e2e tests import `src/...` and fail to resolve               | Jest `moduleNameMapper` maps `^src/(.*)$` to `<rootDir>/../src/$1` — keep that mapping in `test/jest-e2e.json`.                                                                                        |

## Debugging GraphQL

- Open Playground at `http://localhost:8000/api/v1/vmalpoth` (dev).
- Use `__schema` introspection to inspect generated types.
- If a resolver/guard throws, the global error shape (once a
  [global exception filter](./scalability-roadmap.md) is added) will normalize it.

## Debugging auth

- `auth.api.getSession({ headers })` is the source of truth. Call it in a
  controller with `fromNodeHeaders(req.headers)` to inspect sessions.
- Check that the request reaches the `app.use('/api/auth', ...)` middleware
  (not the unused `AuthController`).
