import { Injectable } from '@nestjs/common';
import { HealthIndicator, type HealthIndicatorResult } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Readiness probe — `GET /health/db` is 200 only if PostgreSQL answers a trivial
 * `SELECT 1`; otherwise Terminus marks the indicator `down` (HTTP 503) so k8s
 * keeps the pod out of rotation until the database is reachable again.
 */
@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return this.getStatus('database', true);
    } catch (err) {
      return this.getStatus('database', false, {
        message:
          err instanceof Error ? err.message : 'database connection failed',
      });
    }
  }
}
