-- CreateEnum: MainCategory
CREATE TYPE "MainCategory" AS ENUM (
    'RESIDENTIAL',
    'COMMERCIAL',
    'INDUSTRIAL',
    'LAND',
    'INSTITUTIONAL_SPECIALIZED'
);

-- CreateEnum: SubCategory
CREATE TYPE "SubCategory" AS ENUM (
    'HOUSE',
    'APARTMENT_FLAT',
    'TOWNHOUSE',
    'ROOM',
    'RESIDENTIAL_BUILDING',
    'OFFICE',
    'RETAIL_SPACE',
    'RESTAURANT_CAFE',
    'HOSPITALITY',
    'COMMERCIAL_BUILDING',
    'WAREHOUSE_GODOWN',
    'FACTORY_MANUFACTURING',
    'LOGISTICS_DISTRIBUTION',
    'WORKSHOP',
    'INDUSTRIAL_BUILDING',
    'RESIDENTIAL_LAND',
    'COMMERCIAL_LAND',
    'AGRICULTURAL_LAND',
    'INDUSTRIAL_LAND',
    'DEVELOPMENT_LAND',
    'HEALTHCARE',
    'EDUCATION',
    'INSTITUTIONAL',
    'COMMUNITY'
);

-- AlterTable: Add mainCategory and subCategory columns to Property
ALTER TABLE "Property" ADD COLUMN "mainCategory" "MainCategory";
ALTER TABLE "Property" ADD COLUMN "subCategory" "SubCategory";

-- CreateIndex
CREATE INDEX "Property_mainCategory_idx" ON "Property"("mainCategory");
CREATE INDEX "Property_subCategory_idx" ON "Property"("subCategory");

-- Data Migration: Map existing propertyType values to new categories
UPDATE "Property" SET "mainCategory" = 'LAND', "subCategory" = 'RESIDENTIAL_LAND' WHERE "propertyType" = 'RESIDENTIAL_LAND';
UPDATE "Property" SET "mainCategory" = 'LAND', "subCategory" = 'COMMERCIAL_LAND' WHERE "propertyType" = 'COMMERCIAL_LAND';
UPDATE "Property" SET "mainCategory" = 'LAND', "subCategory" = 'AGRICULTURAL_LAND' WHERE "propertyType" = 'AGRICULTURAL_LAND';
UPDATE "Property" SET "mainCategory" = 'RESIDENTIAL', "subCategory" = 'HOUSE' WHERE "propertyType" = 'RESIDENTIAL_HOUSE';
UPDATE "Property" SET "mainCategory" = 'COMMERCIAL', "subCategory" = 'OFFICE' WHERE "propertyType" = 'COMMERCIAL_SPACE';
UPDATE "Property" SET "mainCategory" = 'RESIDENTIAL', "subCategory" = 'HOUSE' WHERE "propertyType" = 'HERITAGE_HOME';
