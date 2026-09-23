import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/app/lib/supabase';
import { getTodaySeed } from '@/app/lib/palette';
import { gameCookieName, gameCookieOptions, gameProgress, readSession, signSession } from '@/app/lib/game-session';

export async function POST(request: NextRequest) {
  try {
    const date = getTodaySeed();
    const { data: palette, error } = await createServerClient()
      .from('daily_palettes').select('wheel_colors, hidden_palette').eq('date', date).single();
    if (error || !palette) return NextResponse.json({ error: 'Puzzle unavailable' }, { status: 503 });

    const body = await request.json();
    const guess = body?.guess;
    const wheel: string[] = palette.wheel_colors;
    if (!Array.isArray(guess) || guess.length !== 5 ||
        guess.some(color => typeof color !== 'string' || !wheel.includes(color)) ||
        new Set(guess).size !== 5) {
      return NextResponse.json({ error: 'Choose five different wheel colors' }, { status: 400 });
    }

    const session = readSession(request.cookies.get(gameCookieName())?.value, date);
    const progress = gameProgress(session, palette.hidden_palette);
    if (progress.complete) return NextResponse.json({ error: 'This puzzle is already complete' }, { status: 409 });

    session.guesses.push(guess);
    const result = gameProgress(session, palette.hidden_palette);
    const response = NextResponse.json({
      date,
      result: result.rowResults.at(-1),
      guessCount: session.guesses.length,
      won: result.won,
      complete: result.complete,
      ...(result.complete ? { revealedPalette: palette.hidden_palette } : {}),
    });
    response.cookies.set(gameCookieName(), signSession(session), gameCookieOptions);
    return response;
  } catch (error) {
    console.error('Error scoring guess:', error);
    return NextResponse.json({ error: 'Could not score guess' }, { status: 500 });
  }
}
