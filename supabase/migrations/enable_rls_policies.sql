-- Enable RLS on both tables
ALTER TABLE daily_palettes ENABLE ROW LEVEL SECURITY;
ALTER TABLE palettes ENABLE ROW LEVEL SECURITY;

-- ========================================
-- DAILY_PALETTES POLICIES
-- ========================================

-- Allow everyone to read daily palettes (needed for the game)
CREATE POLICY "Anyone can view daily palettes"
  ON daily_palettes
  FOR SELECT
  TO public
  USING (true);

-- Only service role can insert/update/delete daily palettes
-- (Your edge function uses the service role key)
CREATE POLICY "Service role can manage daily palettes"
  ON daily_palettes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ========================================
-- PALETTES POLICIES (User game results)
-- ========================================

-- Users can insert their own palettes
CREATE POLICY "Users can create their own palettes"
  ON palettes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view only their own palettes
CREATE POLICY "Users can view their own palettes"
  ON palettes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own palettes (for favorites, etc)
CREATE POLICY "Users can update their own palettes"
  ON palettes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own palettes (optional - you may not want this)
CREATE POLICY "Users can delete their own palettes"
  ON palettes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ========================================
-- OPTIONAL: Public stats access
-- ========================================
-- If you want to show aggregate stats (like in the footer),
-- you might want to allow reading count/stats but not individual records.
-- For now, the daily-stats API endpoint uses the service role, so this isn't needed.
