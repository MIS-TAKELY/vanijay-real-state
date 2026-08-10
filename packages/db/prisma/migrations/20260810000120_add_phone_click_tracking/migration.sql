-- AlterTable
ALTER TABLE "PropertyAnalytics" ADD COLUMN "phoneClickCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "PropertyAnalytics" ADD COLUMN "phoneClicksLast24h" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "PropertyAnalytics" ADD COLUMN "phoneClicksLast7d" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "PropertyAnalytics" ADD COLUMN "phoneClicksLast30d" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PropertyPhoneClickEvent" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "userId" TEXT,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyPhoneClickEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PropertyPhoneClickEvent_propertyId_clickedAt_idx" ON "PropertyPhoneClickEvent"("propertyId", "clickedAt");

-- CreateIndex
CREATE INDEX "PropertyPhoneClickEvent_userId_clickedAt_idx" ON "PropertyPhoneClickEvent"("userId", "clickedAt");

-- AddForeignKey
ALTER TABLE "PropertyPhoneClickEvent" ADD CONSTRAINT "PropertyPhoneClickEvent_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyPhoneClickEvent" ADD CONSTRAINT "PropertyPhoneClickEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;