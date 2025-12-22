-- Backfill palette metadata for existing daily_palettes
-- Run this in your Supabase SQL editor

-- 2025-12-15: Berry/Shade palette
UPDATE daily_palettes 
SET 
  palette_name = 'Berry Contrast',
  palette_description = 'Accent palette with berry character.',
  best_used_for = ARRAY['Food & beverage', 'Beauty products', 'Feminine brands']
WHERE date = '2025-12-15';

-- 2025-12-16: Earth/Tint palette
UPDATE daily_palettes 
SET 
  palette_name = 'Clay Contrast',
  palette_description = 'A earth palette with complementary harmony.',
  best_used_for = ARRAY['Natural products', 'Eco-friendly brands', 'Artisanal goods']
WHERE date = '2025-12-16';

-- 2025-12-17: Berry/Tone palette
UPDATE daily_palettes 
SET 
  palette_name = 'Plum Trinity',
  palette_description = 'Triadic palette with berry character.',
  best_used_for = ARRAY['Food & beverage', 'Beauty products', 'Feminine brands']
WHERE date = '2025-12-17';

-- 2025-12-18: Earth/Tint palette
UPDATE daily_palettes 
SET 
  palette_name = 'Terra Harmony',
  palette_description = 'A earth palette with analogous harmony.',
  best_used_for = ARRAY['Natural products', 'Eco-friendly brands', 'Artisanal goods']
WHERE date = '2025-12-18';

-- 2025-12-19: Ocean/Vivid palette
UPDATE daily_palettes 
SET 
  palette_name = 'Wave Split',
  palette_description = 'A ocean palette with split-complementary harmony.',
  best_used_for = ARRAY['Marine businesses', 'Travel & tourism', 'Wellness brands']
WHERE date = '2025-12-19';

-- 2025-12-20: Vibrant/Neutral palette
UPDATE daily_palettes 
SET 
  palette_name = 'Electric Quartet',
  palette_description = 'Tetradic (Double-Complementary) palette with vibrant character.',
  best_used_for = ARRAY['Youth marketing', 'Entertainment', 'Creative industries']
WHERE date = '2025-12-20';

-- 2025-12-21: Citrus/Vivid palette
UPDATE daily_palettes 
SET 
  palette_name = 'Citrus Balance',
  palette_description = 'A citrus palette with square harmony.',
  best_used_for = ARRAY['Summer campaigns', 'Fresh brands', 'Energy products']
WHERE date = '2025-12-21';

-- 2025-12-22: Vibrant/Vivid palette
UPDATE daily_palettes 
SET 
  palette_name = 'Burst Duality',
  palette_description = 'A vibrant palette with rectangular harmony.',
  best_used_for = ARRAY['Youth marketing', 'Entertainment', 'Creative industries']
WHERE date = '2025-12-22';

-- Verify the updates
SELECT date, palette_name, palette_description, best_used_for
FROM daily_palettes
ORDER BY date;
