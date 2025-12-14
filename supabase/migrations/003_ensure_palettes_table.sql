-- Migration: Ensure palettes table exists with correct schema and RLS

-- Drop the table if it exists with wrong schema (this is a safety measure)
-- Comment out if you have existing data you need to preserve
-- DROP TABLE IF EXISTS public.palettes CASCADE;

-- Create palettes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.palettes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  colors TEXT[] NOT NULL,
  scheme TEXT NOT NULL,
  guess_count INTEGER NOT NULL,
  won BOOLEAN NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_palettes_user_id ON public.palettes(user_id);
CREATE INDEX IF NOT EXISTS idx_palettes_date ON public.palettes(date);
CREATE INDEX IF NOT EXISTS idx_palettes_user_date ON public.palettes(user_id, date);

-- Enable RLS on palettes table
ALTER TABLE public.palettes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own palettes" ON public.palettes;
DROP POLICY IF EXISTS "Users can insert their own palettes" ON public.palettes;
DROP POLICY IF EXISTS "Users can update their own palettes" ON public.palettes;
DROP POLICY IF EXISTS "Users can delete their own palettes" ON public.palettes;

-- Create RLS policies for palettes
CREATE POLICY "Users can view their own palettes" ON public.palettes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own palettes" ON public.palettes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own palettes" ON public.palettes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own palettes" ON public.palettes
  FOR DELETE USING (auth.uid() = user_id);

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_palettes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on palettes table
DROP TRIGGER IF EXISTS update_palettes_updated_at ON public.palettes;
CREATE TRIGGER update_palettes_updated_at
BEFORE UPDATE ON public.palettes
FOR EACH ROW
EXECUTE FUNCTION update_palettes_updated_at();
