/*
  Warnings:

  - You are about to drop the column `propertyType` on the `Property` table. All the data in the column will be lost.
  - Made the column `mainCategory` on table `Property` required. This step will fail if there are existing NULL values in that column.
  - Made the column `subCategory` on table `Property` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Property_propertyType_idx";

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "propertyType",
ALTER COLUMN "mainCategory" SET NOT NULL,
ALTER COLUMN "subCategory" SET NOT NULL;

-- DropEnum
DROP TYPE "PropertyType";
