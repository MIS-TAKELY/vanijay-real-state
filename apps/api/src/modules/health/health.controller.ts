import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { SkipThrottle } from '@nestjs/throttler';
import { AppHealthIndicator } from './app-health.indicator';
import { PrismaHealthIndicator } from './prisma-health.indicator';

/**
 * k8s probes.
 *  - GET /health     → liveness  (is the process alive?)
 *  - GET /health/db  → readiness (can it reach PostgreSQL?)
 *
 * `@SkipThrottle()` opts these endpoints out of the global throttler guard so
 * health probes can never receive a 429 — k8s retry/backoff loops must not be
 * tripped by the very circuit that's checking whether to route traffic in.
 */
@Controller('health')
@SkipThrottle()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly app: AppHealthIndicator,
    private readonly db: PrismaHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  public liveness() {
    return this.health.check([() => this.app.isHealthy()]);
  }

  @Get('db')
  @HealthCheck()
  public readiness() {
    return this.health.check([() => this.db.isHealthy()]);
  }
}
