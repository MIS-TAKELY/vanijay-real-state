import { Injectable } from '@nestjs/common';
import { HealthIndicator, type HealthIndicatorResult } from '@nestjs/terminus';
import { PrismaClient } from '@repo/db';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private readonly prisma: PrismaClient) {
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
