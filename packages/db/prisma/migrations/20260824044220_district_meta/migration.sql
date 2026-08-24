-- CreateEnum
CREATE TYPE "DistrictTopography" AS ENUM ('VALLEY', 'TERAI', 'HILL', 'MOUNTAIN');

-- CreateEnum
CREATE TYPE "DistrictTier" AS ENUM ('CADASTRAL', 'FIELD', 'PENDING');

-- CreateTable
CREATE TABLE "DistrictMeta" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "topography" "DistrictTopography" NOT NULL DEFAULT 'HILL',
    "tier" "DistrictTier" NOT NULL DEFAULT 'PENDING',
    "avgRatePerAana" INTEGER,
    "trendPct" DOUBLE PRECISION,
    "description" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DistrictMeta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DistrictMeta_slug_key" ON "DistrictMeta"("slug");

-- CreateIndex
CREATE INDEX "DistrictMeta_province_idx" ON "DistrictMeta"("province");

-- CreateIndex
CREATE INDEX "DistrictMeta_topography_tier_idx" ON "DistrictMeta"("topography", "tier");
