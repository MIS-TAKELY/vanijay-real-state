import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { AppHealthIndicator } from './app-health.indicator';
import { HealthController } from './health.controller';
import { PrismaHealthIndicator } from './prisma-health.indicator';


@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [AppHealthIndicator, PrismaHealthIndicator],
})
export class HealthModule {}
