import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { AppHealthIndicator } from './app-health.indicator';
import { HealthController } from './health.controller';
import { PrismaHealthIndicator } from './prisma-health.indicator';

/**
 * Terminus health probes:
 *  - GET /health      → liveness  (is the process alive?)
 *  - GET /health/db   → readiness (can it reach Postgresql?)
 *
 * `PrismaService` is `@Global()` (see `PrismaModule`), so it's injectable here
 * without importing `PrismaModule` — the same convention `PropertiesModule`
 * relies on in `PropertiesService`.
 */
@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [AppHealthIndicator, PrismaHealthIndicator],
})
export class HealthModule {}
