-- The GitHub Actions schedule stopped running in February 2026. Keep the
-- database cron as the primary generator. 16:00 UTC is 9 AM Pacific during
-- daylight saving time; 17:00 UTC is 9 AM Pacific in winter. The Edge
-- Function skips the early call and returns success if the date exists.
-- One-time prerequisite: store the project's legacy anon key in Supabase
-- Vault with name colorchase_palette_anon_key. Never commit it to Git.
-- The production Vault secret was provisioned on September 24, 2026.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.decrypted_secrets
                 WHERE name = 'colorchase_palette_anon_key'
                   AND decrypted_secret IS NOT NULL) THEN
    RAISE EXCEPTION 'Create Vault secret colorchase_palette_anon_key before scheduling palettes';
  END IF;
END $$;

SELECT cron.schedule(
  'generate-daily-palette',
  '0 16,17 * * *',
  $job$
    SELECT net.http_post(
      url := 'https://iczkzoupdzkakgzvwdye.supabase.co/functions/v1/generate-daily-palette',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'apikey', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'colorchase_palette_anon_key'),
        'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'colorchase_palette_anon_key')
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $job$
);
