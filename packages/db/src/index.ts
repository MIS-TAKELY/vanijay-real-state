// Must load .env BEFORE building the Prisma client below — the pg pool reads
// process.env.DATABASE_URL at construction time. If dotenv runs later (e.g. a
// consuming app imports this package before its own dotenv config), the pool
// gets an undefined connection string and every query fails with
// "client password must be a string". Keep this import first.
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export * from "@prisma/client";
export { prisma };
