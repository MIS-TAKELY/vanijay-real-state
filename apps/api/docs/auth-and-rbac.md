# Auth & RBAC

Authentication is handled by **Better Auth** (`packages/auth`, package
`@repo/auth`) using a Prisma adapter, so users/sessions/accounts live in the same
Postgres database as the domain models. Better Auth provides email/password +
email OTP verification, Google OAuth, and session management.

## How auth is mounted (important)

Better Auth must read the **raw** request body to verify signatures, so the app
is created with `bodyParser: false` and the auth handler is mounted as
middleware **before** `express.json()`:

```ts
// src/main.ts
const app = await NestFactory.create(AppModule, { bodyParser: false });

// ... ValidationPipe, CORS ...

const authHandler = toNodeHandler(auth);
app.use('/api/auth', authHandler);   // Better Auth sees the RAW body

// AFTER the auth handler, enable JSON parsing for REST + GraphQL
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

**Order matters.** If `express.json()` runs first, the body stream is consumed
and Better Auth can't verify request signatures — you'll see `body missing` or
verification errors.

### Why auth is middleware, not a Nest controller

There is a file `modules/rest/auth/auth.controller.ts` with a `@Controller('api/auth')`
that wraps `toNodeHandler(auth)`. **However, it is not wired in**: `AuthModule`
is `@Module({})` (empty), so the controller is dead scaffolding. Auth is actually
served by the `app.use('/api/auth', authHandler)` middleware in `main.ts`.

> 🧹 **Cleanup item:** Either delete the unused `auth.controller.ts` /
> `auth.service.ts` scaffolding, or remove the `app.use('/api/auth', ...)`
> middleware and wire `AuthController` into `AuthModule`. Middleware mounting is
> the recommended approach because Better Auth needs the raw body — see
> [Scalability Roadmap → Auth](./scalability-roadmap.md).

## The `auth` instance (`packages/auth/src/auth.ts`)

```ts
export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  user: {
    additionalFields: {
      phoneNumber: { type: 'string', required: false, unique: true },
      role: { type: 'string[]', required: false, defaultValue: ['BUYER'] },

## REST/GraphQL guard — `AuthGuard`

`modules/rest/auth/guards/auth.guard.ts` resolves the Better Auth session and
attaches `user` + `session` to the request. **It already works for both REST and
GraphQL** because it uses `getRequest(context)` from `common/get-request.ts`:

```ts
@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = getRequest(context);                       // http OR graphql
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session) throw new UnauthorizedException();
    req.user = session.user;        // attach user to request
    req.session = session.session;
    return true;
  }
}
```

> ✅ Correct: a single guard protects both transports. Apply it with
> `@UseGuards(AuthGuard)` on any REST controller or GraphQL resolver.

## Role-based access — `RolesGuard` + `@Roles`

`modules/rest/auth/guards/role/role.guard.ts` reads `ROLES_KEY` metadata via
`Reflector` and checks the user's roles:

```ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;                 // no @Roles → allow

    const request = getRequest(context);
    const userRoles = normalizeUserRoles(request.user);
    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
```

`normalizeUserRoles()` (in `modules/rest/auth/permissions/role.helper.ts`)
tolerates every shape Better Auth / legacy data might return:
`user.roles` (array), `user.role` as an array, or `user.role` as a single
string. It also exports `hasRole()` and `hasAllRoles()` helpers.

### Usage

```ts
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/role/role.guard';

@Controller('api/example')
@UseGuards(AuthGuard, RolesGuard)        // auth first, then RBAC
export class ExampleController {
  @Get()
  @Roles('AGENCY_AGENT', 'ADMIN')         // any of these roles
  findAll(@CurrentUser() user: { id: string }) {
    return { message: `Hello ${user.id}` };
  }
}
```

The same decorators/guards work on GraphQL resolvers:

```ts
@Resolver(() => Property)
@UseGuards(AuthGuard, RolesGuard)
export class PropertiesResolver {
  @Mutation(() => Property)
  @Roles('SELLER', 'AGENCY_AGENT')
  createProperty(@CurrentUser('id') userId: string, /* ... */) { /* ... */ }
}
```

### Valid `UserRole` values

From `packages/db/prisma/schema.prisma`:

`BUYER`, `SELLER`, `AGENCY_AGENT`, `AGENCY_ADMIN`, `SURVEYOR_AGENT`, `ADMIN`.

A user can hold **multiple** roles (`User.role` is `UserRole[]`), and
`RolesGuard` uses `some()` — so a user passes if they hold **at least one** of the
required roles. For "must hold all" semantics, use the `hasAllRoles()` helper
inside a custom guard.
      isVerified: { type: 'boolean', required: false, defaultValue: false },
      agreedToTerms: { type: 'boolean', required: false, defaultValue: false },
      agencyId: { type: 'string', required: false },
    },
  },
  emailAndPassword: { enabled: true, requireEmailVerification: true },
  plugins: [emailOTP({ /* sendVerificationOTP */ expiresIn: 300 })],
  socialProviders: {
    google: { clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! },
  },
  trustedOrigins: [process.env.CLIENT_URL ?? 'http://localhost:3000'],
});
export type Auth = typeof auth;
```

Notes:
- `role` is stored as `type: 'string[]'` matching `User.role` (`UserRole[]`) in Prisma.
- Email OTP is sent via Nodemailer; if `SMTP_HOST` is unset it falls back to an
  **Ethereal** test account and logs the preview URL (great for dev).
- `socialProviders.google` is **always registered** with non-null assertions —
  if `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` are missing the app may fail to
  boot. See [Scalability Roadmap](./scalability-roadmap.md) to make it conditional.
