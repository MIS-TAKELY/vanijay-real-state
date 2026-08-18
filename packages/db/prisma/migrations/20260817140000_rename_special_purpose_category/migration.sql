-- Rename the fifth main category (key "institutional") to "Special Purpose" in
-- CMS rows that were auto-seeded by the admin category editor under the old
-- display name. Only touches rows still carrying the old title.
UPDATE "ContentItem"
SET "title" = 'Special Purpose',
    "updatedAt" = NOW()
WHERE "slot" = 'CATEGORY'
  AND "key" = 'institutional'
  AND "title" = 'Institutional';
