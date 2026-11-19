-- ============================================================
-- Migration 057: Clean up orphaned stub courses, re-attach
-- Basketball / Tennis / Table Tennis courses, publish full
-- curriculum, and localize remaining £ symbols to ₦.
--
-- Idempotent: safe to re-run on live or fresh databases.
-- ============================================================

-- 1. Remove the 4 orphaned stub courses left behind by stub categories
--    ('market-dynamics', 'staking-strategies') and their 8 stub lessons.
DELETE FROM public.lessons
WHERE course_id IN (
  SELECT id FROM public.courses
  WHERE slug IN (
    'how-betting-markets-move',
    'sharp-vs-recreational-money',
    'flat-and-proportional-staking',
    'the-kelly-criterion'
  )
);

DELETE FROM public.courses
WHERE slug IN (
  'how-betting-markets-move',
  'sharp-vs-recreational-money',
  'flat-and-proportional-staking',
  'the-kelly-criterion'
);

-- 2. Re-attach orphaned Basketball, Tennis, and Table Tennis courses
--    to their Sports University categories.
UPDATE public.courses
SET category_id = (SELECT id FROM public.course_categories WHERE slug = 'basketball-analytics' LIMIT 1),
    is_published = true
WHERE slug IN (
  'introduction-to-basketball',
  'basketball-positions-and-roles',
  'basketball-offensive-systems',
  'basketball-defensive-schemes'
)
AND EXISTS (SELECT 1 FROM public.course_categories WHERE slug = 'basketball-analytics');

UPDATE public.courses
SET category_id = (SELECT id FROM public.course_categories WHERE slug = 'tennis-analytics' LIMIT 1),
    is_published = true
WHERE slug IN (
  'how-tennis-scoring-works',
  'tennis-court-surfaces',
  'tennis-serve-return-strategy',
  'tennis-playing-styles',
  'tennis-grand-slams',
  'tennis-rankings-system',
  'tennis-mental-game'
)
AND EXISTS (SELECT 1 FROM public.course_categories WHERE slug = 'tennis-analytics');

UPDATE public.courses
SET category_id = (SELECT id FROM public.course_categories WHERE slug = 'table-tennis-analytics' LIMIT 1),
    is_published = true
WHERE slug IN (
  'table-tennis-core-strokes',
  'table-tennis-rules-scoring',
  'table-tennis-equipment',
  'table-tennis-spin',
  'table-tennis-pro-structure',
  'table-tennis-elite-styles'
)
AND EXISTS (SELECT 1 FROM public.course_categories WHERE slug = 'table-tennis-analytics');

-- 3. Publish all remaining courses with valid categories and their lessons.
UPDATE public.courses
SET is_published = true
WHERE is_published = false
  AND category_id IS NOT NULL;

UPDATE public.lessons
SET is_published = true
WHERE is_published = false;

-- 4. Localize remaining £ currency symbols in lesson bodies to ₦
--    (preserves all arithmetic ratios and worked examples).
UPDATE public.lessons
SET content = replace(content, '£', '₦')
WHERE content LIKE '%£%';
