-- ============================================
-- STEP 1: Create the tables in your Supabase
-- Copy & paste this into Supabase SQL Editor
-- ============================================

-- Table 1: Daily Palettes (the official daily puzzle)
CREATE TABLE IF NOT EXISTS daily_palettes (
  id BIGSERIAL PRIMARY KEY,
  date TEXT UNIQUE NOT NULL,  -- "2025-12-15"
  wheel_colors TEXT[] NOT NULL,  -- All 12 colors
  hidden_palette TEXT[] NOT NULL,  -- The 5 hidden colors
  scheme TEXT,  -- "complementary", "triadic", etc.
  family_name TEXT,  -- "Warm Sunset", "Cool Ocean", etc.
  treatment_name TEXT,  -- "Light & Airy", "Deep & Rich", etc.
  family_key TEXT,
  treatment_key TEXT,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 2: User Game Results (what each player saved)
-- This should already exist, but make sure it has all these fields:
CREATE TABLE IF NOT EXISTS palettes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,  -- "2025-12-15" - links to daily_palettes
  colors TEXT[] NOT NULL,  -- The 5 colors they selected
  guess_count INTEGER NOT NULL,  -- How many tries: 1, 2, 3, 4, or 5
  won BOOLEAN DEFAULT FALSE,  -- Did they win?
  scheme TEXT,  -- The harmony type
  is_favorite BOOLEAN DEFAULT FALSE,  -- Did they favorite it?
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)  -- One result per user per day
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_palettes_date ON daily_palettes(date);
CREATE INDEX IF NOT EXISTS idx_palettes_user_date ON palettes(user_id, date);
CREATE INDEX IF NOT EXISTS idx_palettes_date ON palettes(date);

-- ============================================
-- That's it! Your tables are now ready.
-- ============================================
