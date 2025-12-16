import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/app/lib/supabase';
import { getTodaySeed } from '@/app/lib/palette';

/**
 * GET /api/today-palette
 * Returns today's color wheel and hidden palette from the database
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Get today's date
    const today = getTodaySeed();

    // Fetch from database instead of generating
    const { data: dailyPalette, error } = await supabase
      .from('daily_palettes')
      .select('*')
      .eq('date', today)
      .single();

    if (error || !dailyPalette) {
      return NextResponse.json(
        { error: 'Palette not found for today' },
        { status: 404 }
      );
    }

    // Return the palette
    return NextResponse.json({
      date: today,
      wheelColors: dailyPalette.wheel_colors,
      hiddenPalette: dailyPalette.hidden_palette,
      family: dailyPalette.family_name,
      treatment: dailyPalette.treatment_name,
      scheme: dailyPalette.scheme,
    });
  } catch (error) {
    console.error('Error fetching palette:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
