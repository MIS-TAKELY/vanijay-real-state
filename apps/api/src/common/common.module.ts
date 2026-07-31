import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { GqlThrottlerGuard } from './guards/gql-throttler.guard';

/**
 * Cross-cutting concerns registered through the Nest DI context so they are
 * applied to the real app AND to the testing module automatically (unlike
 * `app.useGlobalPipes/useGlobalFilters` in `main.ts`, which tests bypass).
 *
 *  - APP_PIPE   → global `ValidationPipe` (whitelist + forbidNonWhitelisted + transform)
 *  - APP_FILTER → `GlobalExceptionFilter` (consistent REST + GraphQL errors)
 *  - APP_GUARD  → `GqlThrottlerGuard`: rate-limits REST + GraphQL uniformly. It
 *                  resolves the request through the shared `getRequest` helper
 *                  so it works for the `graphql` transport too; health endpoints
 *                  opt out with `@SkipThrottle()`.
 *
 * Import `CommonModule` once in `AppModule`.
 */
@Module({
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: GqlThrottlerGuard,
    },
  ],
})
export class CommonModule {}
