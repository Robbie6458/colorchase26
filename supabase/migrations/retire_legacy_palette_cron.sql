-- The GitHub workflow now calls the generator at both possible 9 AM Pacific
-- UTC hours. Retire the old fixed-17-UTC database job if it was installed.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'generate-daily-palette') THEN
      PERFORM cron.unschedule('generate-daily-palette');
    END IF;
  END IF;
END $$;
