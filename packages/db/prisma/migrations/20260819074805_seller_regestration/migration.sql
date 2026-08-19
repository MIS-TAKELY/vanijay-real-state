-- CreateEnum
CREATE TYPE "SellerAccountType" AS ENUM ('INDIVIDUAL', 'AGENT', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "SellerSubType" AS ENUM ('OWNER', 'SELLER', 'LANDLORD', 'BROKER', 'REAL_ESTATE_AGENCY', 'DEVELOPER', 'REAL_ESTATE_COMPANY', 'INSTITUTE', 'CORPORATE_OWNER');

-- CreateEnum
CREATE TYPE "SellerRegistrationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- AlterEnum
ALTER TYPE "DocumentType" ADD VALUE 'BUSINESS_REGISTRATION';

-- CreateTable
CREATE TABLE "SellerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountType" "SellerAccountType" NOT NULL,
    "subType" "SellerSubType" NOT NULL,
    "status" "SellerRegistrationStatus" NOT NULL DEFAULT 'DRAFT',
    "fullName" TEXT,
    "ownershipDeclared" BOOLEAN NOT NULL DEFAULT false,
    "ownershipDeclarationText" TEXT,
    "ownershipDeclaredAt" TIMESTAMP(3),
    "businessName" TEXT,
    "representativeName" TEXT,
    "hasBusinessRegistration" BOOLEAN NOT NULL DEFAULT false,
    "registrationNumber" TEXT,
    "businessEmail" TEXT,
    "businessPhone" TEXT,
    "website" TEXT,
    "officeDistrict" TEXT,
    "officeAddress" TEXT,
    "officeLocation" JSONB,
    "submittedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SellerProfile_userId_key" ON "SellerProfile"("userId");

-- CreateIndex
CREATE INDEX "SellerProfile_status_idx" ON "SellerProfile"("status");

-- CreateIndex
CREATE INDEX "SellerProfile_accountType_idx" ON "SellerProfile"("accountType");

-- AddForeignKey
ALTER TABLE "SellerProfile" ADD CONSTRAINT "SellerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
