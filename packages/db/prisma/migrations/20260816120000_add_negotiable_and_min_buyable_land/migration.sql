-- AlterTable: Add negotiable and min buyable land fields to Property
ALTER TABLE "Property" ADD COLUMN "isNegotiable" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Property" ADD COLUMN "minBuyableLandSqFt" DOUBLE PRECISION;
ALTER TABLE "Property" ADD COLUMN "minBuyableUnitSystem" TEXT;
ALTER TABLE "Property" ADD COLUMN "minBuyableRopani" INTEGER DEFAULT 0;
ALTER TABLE "Property" ADD COLUMN "minBuyableAana" INTEGER DEFAULT 0;
ALTER TABLE "Property" ADD COLUMN "minBuyablePaisa" DOUBLE PRECISION DEFAULT 0;
ALTER TABLE "Property" ADD COLUMN "minBuyableDaam" DOUBLE PRECISION DEFAULT 0;
ALTER TABLE "Property" ADD COLUMN "minBuyableBigha" INTEGER DEFAULT 0;
ALTER TABLE "Property" ADD COLUMN "minBuyableKatha" INTEGER DEFAULT 0;
ALTER TABLE "Property" ADD COLUMN "minBuyableDhur" DOUBLE PRECISION DEFAULT 0;
