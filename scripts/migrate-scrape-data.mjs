#!/usr/bin/env node

/**
 * Migrate scrape/kabadi data from one PostgreSQL database to another.
 *
 * Tables migrated:
 *   - KabadiCategory
 *   - KabadiItem        (FK → KabadiCategory)
 *   - ContentItem       (placement = 'KABADI')
 *
 * Usage:
 *   node scripts/migrate-scrape-data.mjs
 *
 * Environment variables (override defaults):
 *   SOURCE_DATABASE_URL  – source PostgreSQL connection string
 *   TARGET_DATABASE_URL  – target PostgreSQL connection string
 */

import pg from "pg";

const SOURCE_URL =
  process.env.SOURCE_DATABASE_URL ||
  "postgresql://postgres:admin@localhost:5432/real-state";

const TARGET_URL =
  process.env.TARGET_DATABASE_URL ||
  "postgresql://vanijayrealstateenterprises@gmail.com:vanijay-real-state@72.61.249.56:5435/postgres";

async function main() {
  console.log("🔗 Connecting to source database...");
  const source = new pg.Client({ connectionString: SOURCE_URL });
  await source.connect();
  console.log("  ✅ Source connected");

  console.log("🔗 Connecting to target database...");
  const target = new pg.Client({ connectionString: TARGET_URL });
  await target.connect();
  console.log("  ✅ Target connected");

  try {
    // ── 1. Read from source ──────────────────────────────────────────
    console.log("\n📖 Reading data from source...");

    const { rows: categories } = await source.query(
      `SELECT * FROM "KabadiCategory" ORDER BY "sortOrder"`
    );
    console.log(`  Found ${categories.length} KabadiCategory rows`);

    const { rows: items } = await source.query(
      `SELECT * FROM "KabadiItem" ORDER BY "sortOrder"`
    );
    console.log(`  Found ${items.length} KabadiItem rows`);

    const { rows: contentItems } = await source.query(
      `SELECT * FROM "ContentItem" WHERE placement = 'KABADI' ORDER BY "sortOrder"`
    );
    console.log(`  Found ${contentItems.length} KABADI ContentItem rows`);

    // ── 2. Write to target ──────────────────────────────────────────
    console.log("\n✍️  Writing data to target...");

    // Ensure enums exist (idempotent)
    await target.query(`
      DO $$ BEGIN
        CREATE TYPE "KabadiUnit" AS ENUM ('KG', 'PIECE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await target.query(`
      DO $$ BEGIN
        CREATE TYPE "ContentPlacement" AS ENUM ('REAL_STATE_HOME','REAL_STATE_STATIC','GOLD','KABADI','GLOBAL');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await target.query(`
      DO $$ BEGIN
        CREATE TYPE "ContentSlot" AS ENUM ('HERO_BANNER','CATEGORY','SECTION','CONTENT_BLOCK','FAQ','STATIC_PAGE','NAV_ITEM','FOOTER','SEO','HOW_IT_WORKS','CTA');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Ensure tables exist (idempotent)
    await target.query(`
      CREATE TABLE IF NOT EXISTS "KabadiCategory" (
        "id" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "nepali" TEXT,
        "icon" TEXT,
        "blurb" TEXT,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "published" BOOLEAN NOT NULL DEFAULT true,
        "seoTitle" TEXT,
        "seoDescription" TEXT,
        "seoKeywords" TEXT,
        "heroImage" TEXT,
        "body" TEXT,
        "faq" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "KabadiCategory_pkey" PRIMARY KEY ("id")
      );
    `);
    await target.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "KabadiCategory_slug_key" ON "KabadiCategory"("slug");
    `);
    await target.query(`
      CREATE INDEX IF NOT EXISTS "KabadiCategory_published_sortOrder_idx" ON "KabadiCategory"("published", "sortOrder");
    `);

    await target.query(`
      CREATE TABLE IF NOT EXISTS "KabadiItem" (
        "id" TEXT NOT NULL,
        "categoryId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "nepali" TEXT,
        "unit" "KabadiUnit" NOT NULL DEFAULT 'KG',
        "rate" DECIMAL(14,2) NOT NULL,
        "note" TEXT,
        "popular" BOOLEAN NOT NULL DEFAULT false,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "published" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "KabadiItem_pkey" PRIMARY KEY ("id")
      );
    `);
    await target.query(`
      CREATE INDEX IF NOT EXISTS "KabadiItem_categoryId_published_sortOrder_idx" ON "KabadiItem"("categoryId", "published", "sortOrder");
    `);
    await target.query(`
      ALTER TABLE "KabadiItem" ADD CONSTRAINT IF NOT EXISTS "KabadiItem_categoryId_fkey"
        FOREIGN KEY ("categoryId") REFERENCES "KabadiCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `);

    await target.query(`
      CREATE TABLE IF NOT EXISTS "ContentItem" (
        "id" TEXT NOT NULL,
        "placement" "ContentPlacement" NOT NULL,
        "slot" "ContentSlot" NOT NULL,
        "key" TEXT NOT NULL,
        "title" TEXT,
        "subtitle" TEXT,
        "body" TEXT,
        "image" TEXT,
        "ctaLabel" TEXT,
        "ctaHref" TEXT,
        "metadata" JSONB,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "published" BOOLEAN NOT NULL DEFAULT true,
        "createdById" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "ContentItem_pkey" PRIMARY KEY ("id")
      );
    `);
    await target.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "ContentItem_placement_slot_key_key" ON "ContentItem"("placement", "slot", "key");
    `);
    await target.query(`
      CREATE INDEX IF NOT EXISTS "ContentItem_placement_slot_published_sortOrder_idx" ON "ContentItem"("placement", "slot", "published", "sortOrder");
    `);

    // Upsert categories
    let catsUpserted = 0;
    for (const c of categories) {
      await target.query(
        `INSERT INTO "KabadiCategory" ("id","slug","name","nepali","icon","blurb","sortOrder","published","seoTitle","seoDescription","seoKeywords","heroImage","body","faq","createdAt","updatedAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
         ON CONFLICT ("id") DO UPDATE SET
           "slug"=EXCLUDED."slug","name"=EXCLUDED."name","nepali"=EXCLUDED."nepali",
           "icon"=EXCLUDED."icon","blurb"=EXCLUDED."blurb","sortOrder"=EXCLUDED."sortOrder",
           "published"=EXCLUDED."published","seoTitle"=EXCLUDED."seoTitle",
           "seoDescription"=EXCLUDED."seoDescription","seoKeywords"=EXCLUDED."seoKeywords",
           "heroImage"=EXCLUDED."heroImage","body"=EXCLUDED."body","faq"=EXCLUDED."faq",
           "updatedAt"=EXCLUDED."updatedAt"`,
        [
          c.id, c.slug, c.name, c.nepali, c.icon, c.blurb,
          c.sortOrder, c.published, c.seoTitle, c.seoDescription,
          c.seoKeywords, c.heroImage, c.body, c.faq, c.createdAt, c.updatedAt,
        ]
      );
      catsUpserted++;
    }
    console.log(`  ✅ KabadiCategory: ${catsUpserted} upserted`);

    // Upsert items
    let itemsUpserted = 0;
    for (const i of items) {
      await target.query(
        `INSERT INTO "KabadiItem" ("id","categoryId","name","nepali","unit","rate","note","popular","sortOrder","published","createdAt","updatedAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT ("id") DO UPDATE SET
           "categoryId"=EXCLUDED."categoryId","name"=EXCLUDED."name","nepali"=EXCLUDED."nepali",
           "unit"=EXCLUDED."unit","rate"=EXCLUDED."rate","note"=EXCLUDED."note",
           "popular"=EXCLUDED."popular","sortOrder"=EXCLUDED."sortOrder",
           "published"=EXCLUDED."published","updatedAt"=EXCLUDED."updatedAt"`,
        [
          i.id, i.categoryId, i.name, i.nepali, i.unit, i.rate,
          i.note, i.popular, i.sortOrder, i.published, i.createdAt, i.updatedAt,
        ]
      );
      itemsUpserted++;
    }
    console.log(`  ✅ KabadiItem: ${itemsUpserted} upserted`);

    // Upsert KABADI content items
    let contentUpserted = 0;
    for (const ci of contentItems) {
      await target.query(
        `INSERT INTO "ContentItem" ("id","placement","slot","key","title","subtitle","body","image","ctaLabel","ctaHref","metadata","sortOrder","published","createdById","createdAt","updatedAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
         ON CONFLICT ("id") DO UPDATE SET
           "placement"=EXCLUDED."placement","slot"=EXCLUDED."slot","key"=EXCLUDED."key",
           "title"=EXCLUDED."title","subtitle"=EXCLUDED."subtitle","body"=EXCLUDED."body",
           "image"=EXCLUDED."image","ctaLabel"=EXCLUDED."ctaLabel","ctaHref"=EXCLUDED."ctaHref",
           "metadata"=EXCLUDED."metadata","sortOrder"=EXCLUDED."sortOrder",
           "published"=EXCLUDED."published","updatedAt"=EXCLUDED."updatedAt"`,
        [
          ci.id, ci.placement, ci.slot, ci.key, ci.title, ci.subtitle,
          ci.body, ci.image, ci.ctaLabel, ci.ctaHref, ci.metadata,
          ci.sortOrder, ci.published, ci.createdById, ci.createdAt, ci.updatedAt,
        ]
      );
      contentUpserted++;
    }
    console.log(`  ✅ ContentItem (KABADI): ${contentUpserted} upserted`);

    // ── Summary ──────────────────────────────────────────────────────
    console.log("\n🎉 Migration complete!");
    console.log(`   Categories:    ${catsUpserted}`);
    console.log(`   Items:         ${itemsUpserted}`);
    console.log(`   Content Items: ${contentUpserted}`);
  } finally {
    await source.end();
    await target.end();
    console.log("\n🔌 Connections closed");
  }
}

main().catch((err) => {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
});
