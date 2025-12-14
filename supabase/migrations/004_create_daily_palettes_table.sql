-- Migration: Create daily_palettes table to store the palette for each day

-- Create daily_palettes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.daily_palettes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date TEXT NOT NULL UNIQUE,
  colors TEXT[] NOT NULL,
  scheme TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_daily_palettes_date ON public.daily_palettes(date);

-- Enable RLS on daily_palettes table (allow all to view, no one to modify)
ALTER TABLE public.daily_palettes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view daily palettes" ON public.daily_palettes;
DROP POLICY IF EXISTS "No one can insert daily palettes" ON public.daily_palettes;
DROP POLICY IF EXISTS "No one can update daily palettes" ON public.daily_palettes;
DROP POLICY IF EXISTS "No one can delete daily palettes" ON public.daily_palettes;

-- Create RLS policies for daily_palettes (read-only to all)
CREATE POLICY "Anyone can view daily palettes" ON public.daily_palettes
  FOR SELECT USING (true);

-- Disable insert/update/delete by default (will be done via API with service role)
CREATE POLICY "No one can insert daily palettes" ON public.daily_palettes
  FOR INSERT WITH CHECK (false);

CREATE POLICY "No one can update daily palettes" ON public.daily_palettes
  FOR UPDATE USING (false);

CREATE POLICY "No one can delete daily palettes" ON public.daily_palettes
  FOR DELETE USING (false);
