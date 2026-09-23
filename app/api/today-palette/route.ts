import { NextRequest, NextResponse } from 'next/server';
import { getDailyPuzzle } from '@/app/lib/daily-puzzle';
import { getTodaySeed } from '@/app/lib/palette';
import { gameCookieName, gameProgress, readSession } from '@/app/lib/game-session';

/**
 * GET /api/today-palette
 * Returns the wheel and the current player's saved progress. The ordered answer
 * is only returned once this player has finished the puzzle.
 */
export async function GET(request: NextRequest) {
  try {
    // Get today's date
    const today = getTodaySeed();
    const dailyPalette = await getDailyPuzzle(today);

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
