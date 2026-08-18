-- Replace legacy homepage category tiles with the five canonical main
-- categories. The previous REAL_STATE_HOME/CATEGORY rows (apartments, villas,
-- land, commercial) were ad-hoc seeds that predated the admin category editor,
-- so the homepage strip rendered only 4 tiles and never the real main
-- categories (Residential, Commercial, Industrial, Land, Special Purpose).
DELETE FROM "ContentItem"
WHERE "placement" = 'REAL_STATE_HOME' AND "slot" = 'CATEGORY';

INSERT INTO "ContentItem" ("id", "placement", "slot", "key", "title", "image", "metadata", "sortOrder", "published", "createdAt", "updatedAt") VALUES
('seed-residential',   'REAL_STATE_HOME', 'CATEGORY', 'residential',   'Residential',    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&h=200&fit=crop', '{"mainCategory":"RESIDENTIAL","color":"from-blue-500 to-purple-600","darkColor":"from-blue-600 to-purple-700"}',               0, true, NOW(), NOW()),
('seed-commercial',    'REAL_STATE_HOME', 'CATEGORY', 'commercial',    'Commercial',     'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=200&fit=crop', '{"mainCategory":"COMMERCIAL","color":"from-amber-500 to-orange-600","darkColor":"from-amber-600 to-orange-700"}',             1, true, NOW(), NOW()),
('seed-industrial',    'REAL_STATE_HOME', 'CATEGORY', 'industrial',    'Industrial',     'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop', '{"mainCategory":"INDUSTRIAL","color":"from-slate-500 to-zinc-700","darkColor":"from-slate-600 to-zinc-800"}',                 2, true, NOW(), NOW()),
('seed-land',          'REAL_STATE_HOME', 'CATEGORY', 'land',          'Land',           'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200&h=200&fit=crop', '{"mainCategory":"LAND","color":"from-emerald-500 to-teal-600","darkColor":"from-emerald-600 to-teal-700"}',                   3, true, NOW(), NOW()),
('seed-institutional', 'REAL_STATE_HOME', 'CATEGORY', 'institutional', 'Special Purpose','https://images.unsplash.com/photo-1562774053-701939374585?w=200&h=200&fit=crop', '{"mainCategory":"INSTITUTIONAL_SPECIALIZED","color":"from-rose-500 to-pink-600","darkColor":"from-rose-600 to-pink-700"}',       4, true, NOW(), NOW());
