import { NextResponse } from 'next/server';
import { createServerClient } from '@/app/lib/supabase';
import { getTodaySeed, pacificHour } from '@/app/lib/palette';

// The daily Instagram illustration deliberately uses the five answer colors.
// Disclose only the unordered set, and only after players have had an hour.
export async function GET() {
  if (pacificHour() < 10) return NextResponse.json({ error: 'Palette available at 10 AM Pacific' }, { status: 404 });
  try {
    const date = getTodaySeed();
    const { data, error } = await createServerClient()
      .from('daily_palettes').select('hidden_palette').eq('date', date).single();
    if (error || !data) return NextResponse.json({ error: 'Palette unavailable' }, { status: 404 });
    return NextResponse.json({ date, colors: [...data.hidden_palette].sort() },
      { headers: { 'Cache-Control': 'public, max-age=60' } });
  } catch (error) {
    console.error('Error fetching social palette:', error);
    return NextResponse.json({ error: 'Palette unavailable' }, { status: 500 });
  }
}
