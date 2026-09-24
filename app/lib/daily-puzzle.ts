import { unstable_cache } from 'next/cache';
import { createServerClient } from '@/app/lib/supabase';

// Shared by the initial puzzle load and guess scoring. The date is part of the
// cache key, so a new day never reuses yesterday's answer. Only server code
// imports this function; the response routes decide what a player can see.
export const getDailyPuzzle = unstable_cache(async (date: string) => {
  const client = createServerClient();
  const read = () => client
    .from('daily_palettes')
    .select('wheel_colors, hidden_palette, family_name, treatment_name, scheme')
    .eq('date', date)
    .single();
  let { data, error } = await read();

  // Scheduled GitHub Actions can be late or missed. When the first player
  // arrives after reset, ask the idempotent generator to fill a missing day.
  // Its own Pacific-time guard prevents generation before the 9 AM reset.
  if (!data && error?.code === 'PGRST116') {
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (key && url) {
      const response = await fetch(`${url}/functions/v1/generate-daily-palette`, {
        method: 'POST',
        headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: '{}',
        cache: 'no-store',
      });
      if (!response.ok) console.error('Daily palette generator failed:', response.status);
      // Another simultaneous request may have inserted the palette first.
      ({ data, error } = await read());
    }
  }

  // Throw rather than caching an absent puzzle during the daily reset.
  if (error || !data) throw new Error(`Palette unavailable for ${date}: ${error?.message ?? 'not found'}`);
  return data;
}, ['daily-puzzle'], { revalidate: 60 });
