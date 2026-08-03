import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { SkipThrottle } from '@nestjs/throttler';
import { AppHealthIndicator } from './app-health.indicator';
import { PrismaHealthIndicator } from './prisma-health.indicator';


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
