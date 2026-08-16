-- AlterTable: Add type-specific Step 3 spec fields to Property
-- (building specs, residential/commercial/agricultural land, commercial space, heritage home)

-- Building specs (RESIDENTIAL_HOUSE / COMMERCIAL_SPACE / HERITAGE_HOME)
ALTER TABLE "Property" ADD COLUMN "builtUpAreaSqFt" DOUBLE PRECISION;
ALTER TABLE "Property" ADD COLUMN "propertySubtype" TEXT;
ALTER TABLE "Property" ADD COLUMN "yearBuilt" INTEGER;
ALTER TABLE "Property" ADD COLUMN "constructionStatus" TEXT;
ALTER TABLE "Property" ADD COLUMN "floorNumber" INTEGER;
ALTER TABLE "Property" ADD COLUMN "totalFloors" INTEGER;
ALTER TABLE "Property" ADD COLUMN "bedrooms" INTEGER;
ALTER TABLE "Property" ADD COLUMN "bathrooms" INTEGER;
ALTER TABLE "Property" ADD COLUMN "livingRooms" INTEGER;
ALTER TABLE "Property" ADD COLUMN "kitchens" INTEGER;
ALTER TABLE "Property" ADD COLUMN "balconies" INTEGER;
ALTER TABLE "Property" ADD COLUMN "parking" TEXT;
ALTER TABLE "Property" ADD COLUMN "furnishing" TEXT;
ALTER TABLE "Property" ADD COLUMN "houseFacing" TEXT;
ALTER TABLE "Property" ADD COLUMN "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Residential land
ALTER TABLE "Property" ADD COLUMN "plotShape" TEXT;
ALTER TABLE "Property" ADD COLUMN "frontageFt" DOUBLE PRECISION;
ALTER TABLE "Property" ADD COLUMN "boundaryWall" TEXT;
ALTER TABLE "Property" ADD COLUMN "landClearance" BOOLEAN NOT NULL DEFAULT false;

-- Commercial land
ALTER TABLE "Property" ADD COLUMN "depthFt" DOUBLE PRECISION;
ALTER TABLE "Property" ADD COLUMN "zoning" TEXT;
ALTER TABLE "Property" ADD COLUMN "setbackAvailable" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Property" ADD COLUMN "setbackText" TEXT;
ALTER TABLE "Property" ADD COLUMN "suitableFor" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Property" ADD COLUMN "parkingSpaces" INTEGER;

-- Agricultural land
ALTER TABLE "Property" ADD COLUMN "landClassification" TEXT;
ALTER TABLE "Property" ADD COLUMN "soilType" TEXT;
ALTER TABLE "Property" ADD COLUMN "waterSources" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Property" ADD COLUMN "irrigationType" TEXT;
ALTER TABLE "Property" ADD COLUMN "currentCrops" TEXT;
ALTER TABLE "Property" ADD COLUMN "fencing" TEXT;
ALTER TABLE "Property" ADD COLUMN "electricityAvailable" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Property" ADD COLUMN "terrain" TEXT;
ALTER TABLE "Property" ADD COLUMN "annualYield" TEXT;
ALTER TABLE "Property" ADD COLUMN "farmStructures" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Commercial space
ALTER TABLE "Property" ADD COLUMN "ceilingHeightFt" DOUBLE PRECISION;
ALTER TABLE "Property" ADD COLUMN "parkingAvailable" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Property" ADD COLUMN "parkingType" TEXT;
ALTER TABLE "Property" ADD COLUMN "priceType" TEXT;
ALTER TABLE "Property" ADD COLUMN "leaseAvailable" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Property" ADD COLUMN "leaseMonthlyRent" DOUBLE PRECISION;
ALTER TABLE "Property" ADD COLUMN "commercialFeatures" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Property" ADD COLUMN "zoningLegal" TEXT;

-- Heritage home
ALTER TABLE "Property" ADD COLUMN "heritageType" TEXT;
ALTER TABLE "Property" ADD COLUMN "heritageEra" TEXT;
ALTER TABLE "Property" ADD COLUMN "heritageGrade" TEXT;
ALTER TABLE "Property" ADD COLUMN "courtyard" TEXT;
ALTER TABLE "Property" ADD COLUMN "traditionalFeatures" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Property" ADD COLUMN "renovationStatus" TEXT;
