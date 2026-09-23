import { unstable_cache } from 'next/cache';
import { createServerClient } from '@/app/lib/supabase';

// Shared by the initial puzzle load and guess scoring. The date is part of the
// cache key, so a new day never reuses yesterday's answer. Only server code
// imports this function; the response routes decide what a player can see.
export const getDailyPuzzle = unstable_cache(async (date: string) => {
  const { data, error } = await createServerClient()
    .from('daily_palettes')
    .select('wheel_colors, hidden_palette, family_name, treatment_name, scheme')
    .eq('date', date)
    .single();

  // Throw rather than caching an absent puzzle during the daily reset.
  if (error || !data) throw new Error(`Palette unavailable for ${date}: ${error?.message ?? 'not found'}`);
  return data;
}, ['daily-puzzle'], { revalidate: 60 });
