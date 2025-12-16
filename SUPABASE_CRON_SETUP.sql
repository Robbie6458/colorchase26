-- ============================================
-- STEP 3: Set up the Cron Job in Supabase
-- Copy & paste this into Supabase SQL Editor
-- ============================================

-- First, make sure the pgcron extension is enabled
-- (Usually already enabled in Supabase, but this ensures it)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a function that calls your Edge Function
-- This will be triggered by the cron job
CREATE OR REPLACE FUNCTION trigger_generate_palette()
RETURNS void AS $$
DECLARE
  response RECORD;
BEGIN
  -- Call your Supabase Edge Function
  -- Replace YOUR_PROJECT_URL with your actual Supabase project URL
  SELECT * INTO response FROM
  extensions.http_post(
    'https://YOUR_PROJECT_ID.supabase.co/functions/v1/generate-daily-palette',
    '{}',
    'application/json',
    'Bearer YOUR_ANON_KEY'
  );
  
  INSERT INTO audit_log (action, details) 
  VALUES ('palette_generation', response::text);
  
  RAISE NOTICE 'Palette generation triggered at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule the cron job to run at 9:00 AM UTC every day
-- Cron format: minute (0-59), hour (0-23), day of month, month, day of week
-- "0 9 * * *" = at 9:00 AM, every day
SELECT cron.schedule(
  'generate_daily_palette_job',  -- Job name
  '0 9 * * *',                   -- At 9:00 AM UTC, every day
  'SELECT trigger_generate_palette()'
);

-- Optional: Create an audit log table to track when palettes are generated
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  action TEXT,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: View your cron jobs to verify it's scheduled
-- Run this query to see all scheduled cron jobs:
-- SELECT * FROM cron.job;

-- Optional: To unschedule the job (if you need to later):
-- SELECT cron.unschedule('generate_daily_palette_job');

-- ============================================
-- That's it! Your cron job is now set up.
-- It will automatically run at 9:00 AM UTC every day
-- ============================================
