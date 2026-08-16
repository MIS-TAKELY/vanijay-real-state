/**
 * Temporary e2e helper — creates/removes the BUYER+SELLER test user used by
 * the Playwright draft-persistence check. Mirrors packages/db/prisma/seed.ts.
 * Run from packages/db: npx tsx e2e-create-user.ts [create|delete]
 */
import "dotenv/config";
import { hashPassword } from "better-auth/crypto";
import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const EMAIL = "e2e-wizard@example.com";
const PASSWORD = "WizardTest@2026";

async function main() {
  const mode = process.argv[2] ?? "create";
  if (mode === "delete") {
    await prisma.user.deleteMany({ where: { email: EMAIL } });
    console.log(`deleted ${EMAIL}`);
    return;
  }
  const existing = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (existing) {
    console.log(`user already exists: ${existing.id}`);
    return;
  }
  const now = new Date();
  const id = "e2e-wizard-" + randomUUID().slice(0, 8);
  const passwordHash = await hashPassword(PASSWORD);
  await prisma.user.create({
    data: {
      id,
      name: "E2E Wizard Tester",
      email: EMAIL,
      emailVerified: true,
      role: ["BUYER", "SELLER"],
      isVerified: true,
      agreedToTerms: true,
      phoneNumber: "+9779800000099",
      phoneNumberVerified: true,
      createdAt: now,
      updatedAt: now,
      accounts: {
        create: {
          id: "acct-" + randomUUID().slice(0, 8),
          accountId: id,
          providerId: "credential",
          password: passwordHash,
          createdAt: now,
          updatedAt: now,
        },
      },
    },
  });
  console.log(`created ${EMAIL} (${id}) / ${PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
