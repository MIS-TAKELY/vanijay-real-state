-- AlterTable: Add SEO and content fields to KabadiCategory
ALTER TABLE "KabadiCategory" ADD COLUMN "seoTitle" TEXT;
ALTER TABLE "KabadiCategory" ADD COLUMN "seoDescription" TEXT;
ALTER TABLE "KabadiCategory" ADD COLUMN "seoKeywords" TEXT;
ALTER TABLE "KabadiCategory" ADD COLUMN "heroImage" TEXT;
ALTER TABLE "KabadiCategory" ADD COLUMN "body" TEXT;
ALTER TABLE "KabadiCategory" ADD COLUMN "faq" JSONB;
