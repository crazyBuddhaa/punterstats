-- ============================================================
-- PunterStat — Migration 064: Deduplicate Repeated Lesson
-- Benchmarks & Worked Examples
--
-- Migration 061 appended 5 identical "Real-Data Benchmark /
-- Simulation / Pattern" sections (including identical worked
-- examples) across 281 Betting Academy lessons. This migration
-- keeps each benchmark block exclusively on its single most
-- relevant canonical lesson and strips the copy-pasted block
-- from all other lessons while preserving each lesson's own
-- unique content and Key Takeaway.
-- ============================================================

-- 1. PunterStat v2.0 Model Calibration vs Market (keep only on anatomy-of-predictive-edge)
UPDATE public.lessons
SET content = regexp_replace(
  content,
  '<h2>Real-Data Benchmark: PunterStat v2\.0 Model Calibration vs Market</h2>[\s\S]*?(?=<h2>Key Takeaway</h2>|$)',
  '',
  'g'
)
WHERE content LIKE '%<h2>Real-Data Benchmark: PunterStat v2.0 Model Calibration vs Market</h2>%'
  AND slug <> 'anatomy-of-predictive-edge';

-- 2. Sample Size, Variance & Walk-Forward Stability (keep only on how-many-bets-to-know-anything)
UPDATE public.lessons
SET content = regexp_replace(
  content,
  '<h2>Real-Data Benchmark: Sample Size, Variance &amp; Walk-Forward Stability</h2>[\s\S]*?(?=<h2>Key Takeaway</h2>|$)',
  '',
  'g'
)
WHERE content LIKE '%<h2>Real-Data Benchmark: Sample Size, Variance &amp; Walk-Forward Stability</h2>%'
  AND slug <> 'how-many-bets-to-know-anything';

-- 3. How Loss-Chasing ("Tilt") Destroys Long-Run ROI (keep only on understanding-tilt-betting)
UPDATE public.lessons
SET content = regexp_replace(
  content,
  '<h2>Real-Data Pattern: How Loss-Chasing \("Tilt"\) Destroys Long-Run ROI</h2>[\s\S]*?(?=<h2>Key Takeaway</h2>|$)',
  '',
  'g'
)
WHERE content LIKE '%<h2>Real-Data Pattern: How Loss-Chasing ("Tilt") Destroys Long-Run ROI</h2>%'
  AND slug <> 'understanding-tilt-betting';

-- 4. Comparing Staking Systems on a ₦100,000 Bankroll (keep only on purpose-of-staking-strategy)
UPDATE public.lessons
SET content = regexp_replace(
  content,
  '<h2>Real-Data Simulation: Comparing Staking Systems on a ₦100,000 Bankroll</h2>[\s\S]*?(?=<h2>Key Takeaway</h2>|$)',
  '',
  'g'
)
WHERE content LIKE '%<h2>Real-Data Simulation: Comparing Staking Systems on a ₦100,000 Bankroll</h2>%'
  AND slug <> 'purpose-of-staking-strategy';

-- 5. Bookmaker Overround & Closing Line Efficiency (keep only on what-is-the-overround)
UPDATE public.lessons
SET content = regexp_replace(
  content,
  '<h2>Real-Data Benchmark: Bookmaker Overround &amp; Closing Line Efficiency</h2>[\s\S]*?(?=<h2>Key Takeaway</h2>|$)',
  '',
  'g'
)
WHERE content LIKE '%<h2>Real-Data Benchmark: Bookmaker Overround &amp; Closing Line Efficiency</h2>%'
  AND slug <> 'what-is-the-overround';
