/**
 * District metadata seeder — upserts every district from the client catalog
 * into the DistrictMeta table so admins can manage area-guide data from CMS.
 *
 * Usage (from packages/db):
 *   node --experimental-strip-types scripts/seed-districts.ts
 *   DATABASE_URL="postgres://..." node --experimental-strip-types scripts/seed-districts.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { DISTRICT_CATALOG } from "../../../apps/client/constants/district-catalog.ts";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  let created = 0;
  let updated = 0;

  for (const d of DISTRICT_CATALOG) {
    const data = {
      slug: d.slug,
      name: d.name,
      province: d.province,
      topography: d.topography.toUpperCase(),
      tier: d.tier.toUpperCase(),
      avgRatePerAana: d.avgRatePerAana ?? null,
      trendPct: d.trendPct ?? null,
      description: d.description,
    };
    const result = await prisma.districtMeta.upsert({
      where: { slug: d.slug },
      create: data,
      update: data,
    });
    result.createdAt.getTime() === result.updatedAt.getTime()
      ? created++
      : updated++;
    console.log(`✔ ${d.slug} (${d.province})`);
  }

  console.log(
    `\nSeeded ${DISTRICT_CATALOG.length} districts — ${created} created, ${updated} updated.`,
  );
}

main()
  .catch((err) => {
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
