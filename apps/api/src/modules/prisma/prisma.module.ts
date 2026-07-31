import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * `@Global()` so every feature module can inject `PrismaService` without having
 * to import `PrismaModule` explicitly — this is the standard pattern for shared
 * infrastructure modules (Prisma, Config, Logger, …).
 *
 * Exposes `PrismaService` to the rest of the application.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

