-- Enable pg_cron extension if not already enabled
create extension if not exists pg_cron;

-- Schedule daily palette generation at 9am PST (5pm UTC / 17:00 UTC)
-- Note: During PDT (daylight saving), this will be 9am PDT (4pm UTC / 16:00 UTC)
-- You may need to adjust seasonally or use 9am PST year-round
select cron.schedule(
  'generate-daily-palette',           -- Job name
  '0 17 * * *',                       -- At 17:00 UTC (9am PST)
  $$
  select
    net.http_post(
      url := 'https://iczkzoupdzkakgzvwdye.supabase.co/functions/v1/generate-daily-palette',
      headers := '{"Content-Type": "application/json", "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imljemt6b3VwZHprYWtnenZ3ZHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4MTAwNzMsImV4cCI6MjA0ODM4NjA3M30.x3jrJu4uSvz0aO8a4THZnKf3koBLm1OY3LPPEipJQ5U", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imljemt6b3VwZHprYWtnenZ3ZHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4MTAwNzMsImV4cCI6MjA0ODM4NjA3M30.x3jrJu4uSvz0aO8a4THZnKf3koBLm1OY3LPPEipJQ5U"}'::jsonb,
      body := '{}'::jsonb
    ) as request_id;
  $$
);

-- To view scheduled jobs:
-- SELECT * FROM cron.job;

-- To unschedule (if needed):
-- SELECT cron.unschedule('generate-daily-palette');
