-- CreateTable
CREATE TABLE "PropertyAnalytics" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "favoriteCount" INTEGER NOT NULL DEFAULT 0,
    "cartAddCount" INTEGER NOT NULL DEFAULT 0,
    "inquiryCount" INTEGER NOT NULL DEFAULT 0,
    "searchCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "trendingScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "viewsLast24h" INTEGER NOT NULL DEFAULT 0,
    "viewsLast7d" INTEGER NOT NULL DEFAULT 0,
    "viewsLast30d" INTEGER NOT NULL DEFAULT 0,
    "favoritesLast24h" INTEGER NOT NULL DEFAULT 0,
    "favoritesLast7d" INTEGER NOT NULL DEFAULT 0,
    "favoritesLast30d" INTEGER NOT NULL DEFAULT 0,
    "cartAddsLast24h" INTEGER NOT NULL DEFAULT 0,
    "cartAddsLast7d" INTEGER NOT NULL DEFAULT 0,
    "cartAddsLast30d" INTEGER NOT NULL DEFAULT 0,
    "lastCalculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyViewEvent" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "userId" TEXT,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyViewEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertySearchEvent" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT,
    "userId" TEXT,
    "searchQuery" TEXT,
    "filters" JSONB,
    "searchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertySearchEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyShareEvent" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "userId" TEXT,
    "platform" TEXT NOT NULL,
    "sharedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyShareEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PropertyAnalytics_trendingScore_idx" ON "PropertyAnalytics"("trendingScore" DESC);

-- CreateIndex
CREATE INDEX "PropertyAnalytics_propertyId_updatedAt_idx" ON "PropertyAnalytics"("propertyId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyAnalytics_propertyId_key" ON "PropertyAnalytics"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyViewEvent_propertyId_viewedAt_idx" ON "PropertyViewEvent"("propertyId", "viewedAt");

-- CreateIndex
CREATE INDEX "PropertyViewEvent_userId_viewedAt_idx" ON "PropertyViewEvent"("userId", "viewedAt");

-- CreateIndex
CREATE INDEX "PropertySearchEvent_propertyId_searchedAt_idx" ON "PropertySearchEvent"("propertyId", "searchedAt");

-- CreateIndex
CREATE INDEX "PropertySearchEvent_userId_searchedAt_idx" ON "PropertySearchEvent"("userId", "searchedAt");

-- CreateIndex
CREATE INDEX "PropertyShareEvent_propertyId_sharedAt_idx" ON "PropertyShareEvent"("propertyId", "sharedAt");

-- CreateIndex
CREATE INDEX "PropertyShareEvent_userId_sharedAt_idx" ON "PropertyShareEvent"("userId", "sharedAt");

-- AddForeignKey
ALTER TABLE "PropertyAnalytics" ADD CONSTRAINT "PropertyAnalytics_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyViewEvent" ADD CONSTRAINT "PropertyViewEvent_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyViewEvent" ADD CONSTRAINT "PropertyViewEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertySearchEvent" ADD CONSTRAINT "PropertySearchEvent_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertySearchEvent" ADD CONSTRAINT "PropertySearchEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyShareEvent" ADD CONSTRAINT "PropertyShareEvent_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyShareEvent" ADD CONSTRAINT "PropertyShareEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
