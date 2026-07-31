import { ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { getRequest } from '../get-request';

/**
 * ThrottlerGuard protecting BOTH REST (`/api/...`) and GraphQL endpoints via a
 * single global `APP_GUARD`.
 *
 * Nest's stock `ThrottlerGuard` (v6) derives `{ req, res }` from
 * `context.switchToHttp()`, which is unreliable inside the GraphQL execution
 * context. We override `getRequestResponse` — the v6 overridable seam
 * (`ThrottlerGuard` v6 no longer exposes a `getRequest` hook) — and reuse the
 * shared `getRequest(context)` helper, which already returns the express `req`
 * for `'http'` and the GraphQL context `req` for `'graphql'`. It's the same
 * helper `AuthGuard` relies on, so the throttler sees an identical request
 * identity to the auth layer.
 */
export class GqlThrottlerGuard extends ThrottlerGuard {
      protected getRequestResponse(context: ExecutionContext) {
    // `setHeaders: false` is set in ThrottlerModule.forRoot(), so the base
    // guard never touches `res`; we only need to supply the request. We reuse
    // the shared `getRequest` helper (also used by AuthGuard) so the throttler
    // keys off the same express req for HTTP and the GraphQL context req for
    // `graphql` — otherwise the base guard's `switchToHttp().getRequest()`
    // would be wrong for GraphQL operations.
    return { req: getRequest(context), res: context.switchToHttp().getResponse() };
  }
}
