-- CreateEnum
CREATE TYPE "ContentPlacement" AS ENUM ('REAL_STATE_HOME', 'REAL_STATE_STATIC', 'GOLD', 'KABADI', 'GLOBAL');

-- CreateEnum
CREATE TYPE "ContentSlot" AS ENUM ('HERO_BANNER', 'CATEGORY', 'SECTION', 'CONTENT_BLOCK', 'FAQ', 'STATIC_PAGE', 'NAV_ITEM', 'FOOTER', 'SEO', 'HOW_IT_WORKS', 'CTA');

-- CreateEnum
CREATE TYPE "KabadiUnit" AS ENUM ('KG', 'PIECE');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "adminNote" TEXT;

-- CreateTable
CREATE TABLE "ContentItem" (
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

-- CreateTable
CREATE TABLE "StaticPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaticPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NavItem" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NavItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FooterLink" (
    "id" TEXT NOT NULL,
    "column" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FooterLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoConfig" (
    "id" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "keywords" TEXT,
    "robots" TEXT DEFAULT 'index, follow',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetalConfig" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "accentColor" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetalConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetalFaq" (
    "id" TEXT NOT NULL,
    "metalId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MetalFaq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoldPriceOverride" (
    "id" TEXT NOT NULL,
    "metalSlug" TEXT NOT NULL,
    "ask" DECIMAL(14,2),
    "bid" DECIMAL(14,2),
    "unit" TEXT NOT NULL DEFAULT 'oz',
    "currency" TEXT NOT NULL DEFAULT 'NPR',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "setById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoldPriceOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KabadiCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nepali" TEXT,
    "icon" TEXT,
    "blurb" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KabadiCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KabadiItem" (
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

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "summary" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteConfig" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentItem_placement_slot_published_sortOrder_idx" ON "ContentItem"("placement", "slot", "published", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ContentItem_placement_slot_key_key" ON "ContentItem"("placement", "slot", "key");

-- CreateIndex
CREATE UNIQUE INDEX "StaticPage_slug_key" ON "StaticPage"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "StaticPage_route_key" ON "StaticPage"("route");

-- CreateIndex
CREATE INDEX "NavItem_published_sortOrder_idx" ON "NavItem"("published", "sortOrder");

-- CreateIndex
CREATE INDEX "FooterLink_column_sortOrder_idx" ON "FooterLink"("column", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "SeoConfig_route_key" ON "SeoConfig"("route");

-- CreateIndex
CREATE UNIQUE INDEX "MetalConfig_slug_key" ON "MetalConfig"("slug");

-- CreateIndex
CREATE INDEX "MetalFaq_metalId_sortOrder_idx" ON "MetalFaq"("metalId", "sortOrder");

-- CreateIndex
CREATE INDEX "GoldPriceOverride_metalSlug_active_idx" ON "GoldPriceOverride"("metalSlug", "active");

-- CreateIndex
CREATE UNIQUE INDEX "KabadiCategory_slug_key" ON "KabadiCategory"("slug");

-- CreateIndex
CREATE INDEX "KabadiCategory_published_sortOrder_idx" ON "KabadiCategory"("published", "sortOrder");

-- CreateIndex
CREATE INDEX "KabadiItem_categoryId_published_sortOrder_idx" ON "KabadiItem"("categoryId", "published", "sortOrder");

-- CreateIndex
CREATE INDEX "AdminAuditLog_actorId_createdAt_idx" ON "AdminAuditLog"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_entity_entityId_idx" ON "AdminAuditLog"("entity", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "SiteConfig_key_key" ON "SiteConfig"("key");

-- AddForeignKey
ALTER TABLE "ContentItem" ADD CONSTRAINT "ContentItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetalFaq" ADD CONSTRAINT "MetalFaq_metalId_fkey" FOREIGN KEY ("metalId") REFERENCES "MetalConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoldPriceOverride" ADD CONSTRAINT "GoldPriceOverride_setById_fkey" FOREIGN KEY ("setById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KabadiItem" ADD CONSTRAINT "KabadiItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "KabadiCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
