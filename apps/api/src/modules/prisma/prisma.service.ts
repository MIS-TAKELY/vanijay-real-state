import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@repo/db';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * Injectable Prisma client for the Nest DI context.
 *
 * Uses Prisma 7's driver-adapter (`@prisma/adapter-pg`) with the
 * `DATABASE_URL` connection string — the same configuration as the
 * `@repo/db` singleton, but provided through Nest's DI so services can
 * inject it and tests can mock it via `overrideProvider(PrismaService)`.
 *
 * Prisma connects lazily on the first query, so instantiating this service
 * (e.g. during `app.init()` in tests) does NOT open a database connection.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    super({
      adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL,
      }),
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
