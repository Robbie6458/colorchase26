import { createHmac, timingSafeEqual } from 'node:crypto';

export type Guess = string[];
export type GameSession = { date: string; guesses: Guess[] };
export type TileResult = 'correct' | 'misplaced' | 'wrong';

const COOKIE_NAME = 'colorchase_game';

export function gameCookieName() { return COOKIE_NAME; }

function signingKey(): string {
  const key = process.env.GAME_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('A server-side game session signing key is required');
  return key;
}

export function signSession(session: GameSession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  const signature = createHmac('sha256', signingKey()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function readSession(value: string | undefined, date: string): GameSession {
  if (!value || value.length > 3000) return { date, guesses: [] };
  try {
    const [payload, signature, extra] = value.split('.');
    if (!payload || !signature || extra) throw new Error('Invalid cookie');
    const expected = createHmac('sha256', signingKey()).update(payload).digest();
    const actual = Buffer.from(signature, 'base64url');
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new Error('Invalid signature');
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as GameSession;
    if (data.date !== date || !Array.isArray(data.guesses) || data.guesses.length > 5 ||
        data.guesses.some(guess => !Array.isArray(guess) || guess.length !== 5 ||
          guess.some(color => typeof color !== 'string' || !/^#[0-9A-F]{6}$/.test(color)))) {
      throw new Error('Invalid game state');
    }
    return data;
  } catch {
    return { date, guesses: [] };
  }
}

export function scoreGuess(guess: string[], answer: string[]): TileResult[] {
  const remaining = [...answer];
  const results: TileResult[] = Array(5).fill('wrong');
  guess.forEach((color, index) => {
    if (color === remaining[index]) {
      results[index] = 'correct';
      remaining[index] = '';
    }
  });
  guess.forEach((color, index) => {
    if (results[index] === 'correct') return;
    const position = remaining.indexOf(color);
    if (position !== -1) {
      results[index] = 'misplaced';
      remaining[position] = '';
    }
  });
  return results;
}

export function gameProgress(session: GameSession, answer: string[]) {
  const rowResults = session.guesses.map(guess => scoreGuess(guess, answer));
  const won = rowResults.some(row => row.every(result => result === 'correct'));
  const complete = won || session.guesses.length >= 5;
  return { rowResults, won, complete };
}

export const gameCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 48,
};
