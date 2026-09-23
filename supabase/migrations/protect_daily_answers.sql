-- Server routes use the service role. The browser never needs to read the
-- ordered answer directly from Supabase or write its own leaderboard result.
DROP POLICY IF EXISTS "Anyone can view daily palettes" ON daily_palettes;
REVOKE SELECT ON daily_palettes FROM anon, authenticated;

DROP POLICY IF EXISTS "Users can create their own palettes" ON palettes;
DROP POLICY IF EXISTS "Users can update their own palettes" ON palettes;
DROP POLICY IF EXISTS "Users can delete their own palettes" ON palettes;
REVOKE INSERT, UPDATE, DELETE ON palettes FROM anon, authenticated;
