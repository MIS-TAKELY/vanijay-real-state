import { Injectable } from '@nestjs/common';
import { HealthIndicator, type HealthIndicatorResult } from '@nestjs/terminus';

/**
 * Liveness probe — the process itself is up (no I/O dependencies).
 * Served by `GET /health`.
 */
@Injectable()
export class AppHealthIndicator extends HealthIndicator {
  async isHealthy(): Promise<HealthIndicatorResult> {
    return this.getStatus('app', true);
  }
}
