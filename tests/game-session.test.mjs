import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getNextReset, getTodaySeed } from '../app/lib/palette.ts';
import { gameProgress, readSession, scoreGuess, signSession } from '../app/lib/game-session.ts';

test('9 AM Pacific reset follows daylight saving time', () => {
  assert.equal(getTodaySeed(new Date('2026-09-23T15:59:59Z')), '2026-09-22');
  assert.equal(getTodaySeed(new Date('2026-09-23T16:00:00Z')), '2026-09-23');
  assert.equal(getTodaySeed(new Date('2026-01-23T16:59:59Z')), '2026-01-22');
  assert.equal(getTodaySeed(new Date('2026-01-23T17:00:00Z')), '2026-01-23');
  assert.equal(getNextReset(new Date('2026-03-08T15:00:00Z')).toISOString(), '2026-03-08T16:00:00.000Z');
  assert.equal(getNextReset(new Date('2026-11-01T15:00:00Z')).toISOString(), '2026-11-01T17:00:00.000Z');
});

test('scores positions and reveals only on completion', () => {
  const answer = ['#111111','#222222','#333333','#444444','#555555'];
  assert.deepEqual(scoreGuess(['#222222','#111111','#999999','#444444','#333333'], answer),
    ['misplaced','misplaced','wrong','correct','misplaced']);
  assert.equal(gameProgress({ date: '2026-09-23', guesses: [answer] }, answer).complete, true);
  assert.equal(gameProgress({ date: '2026-09-23', guesses: [answer] }, answer).won, true);
});

test('rejects altered, stale, or malformed signed rounds', () => {
  process.env.GAME_SESSION_SECRET = 'test-secret';
  const round = { date: '2026-09-23', guesses: [['#111111','#222222','#333333','#444444','#555555']] };
  const cookie = signSession(round);
  assert.deepEqual(readSession(cookie, round.date), round);
  assert.deepEqual(readSession(cookie + 'tampered', round.date), { date: round.date, guesses: [] });
  assert.deepEqual(readSession(cookie, '2026-09-24'), { date: '2026-09-24', guesses: [] });
});
