import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/app/lib/supabase';
import { getTodaySeed } from '@/app/lib/palette';
import { gameCookieName, gameProgress, readSession } from '@/app/lib/game-session';

/**
 * GET /api/today-palette
 * Returns the wheel and the current player's saved progress. The ordered answer
 * is only returned once this player has finished the puzzle.
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

    const session = readSession(request.cookies.get(gameCookieName())?.value, today);
    const progress = gameProgress(session, dailyPalette.hidden_palette);
    return NextResponse.json({
      date: today,
      wheelColors: dailyPalette.wheel_colors,
      family: dailyPalette.family_name,
      treatment: dailyPalette.treatment_name,
      scheme: dailyPalette.scheme,
      guesses: session.guesses,
      rowResults: progress.rowResults,
      eliminatedColors: session.guesses.flat().filter((color: string) => !dailyPalette.hidden_palette.includes(color)),
      complete: progress.complete,
      won: progress.won,
      ...(progress.complete ? { revealedPalette: dailyPalette.hidden_palette } : {}),
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('Error fetching palette:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
