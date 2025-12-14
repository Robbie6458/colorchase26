"use client";

import { useAuth } from "../lib/auth-context";
import { getTodaySeed } from "../lib/palette";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type GameAny = any;

export default function Overlays({ game }: { game: GameAny }) {
  const router = useRouter();
  const { user, session } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const pendingSaveRef = useRef(false);
  const gameDataRef = useRef<{
    date: string;
    colors: string[];
    scheme: string;
    guessCount: number;
    won: boolean;
  } | null>(null);

  const won = game.rowResults.some((r: any) => r.every((cell: any) => cell === "correct"));
  const lost = game.gameComplete && !won;

  const performSave = async (token: string, paletteData?: any) => {
    setSaving(true);
    setSaveError(null);

    try {
      // Use provided paletteData if available, otherwise use gameDataRef
      const data = paletteData || gameDataRef.current;
      if (!data) {
        throw new Error('No palette data to save');
      }

      const response = await fetch('/api/palettes/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save palette');
      }

      setSaveError(null);
      // Clear the pending save
      gameDataRef.current = null;
      pendingSaveRef.current = false;
      // Redirect to collection page
      router.push('/player');
    } catch (error: any) {
      setSaveError(error?.message || "Error saving palette");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePalette = async () => {
    // If not logged in, open login dialog
    if (!session || !user) {
      // Store the game data for later
      const today = getTodaySeed();
      const guessCount = game.currentRow + 1;
      gameDataRef.current = {
        date: today,
        colors: game.hiddenPattern,
        scheme: game.currentScheme || "custom",
        guessCount,
        won
      };
      pendingSaveRef.current = true;
      game.openLogin?.();
      return;
    }

    // User is logged in, proceed with save
    try {
      const { data: { session: currentSession } } = await (await import("@/app/lib/supabase")).supabase.auth.getSession();
      if (!currentSession?.access_token) {
        throw new Error('No access token available');
      }
      
      // Create palette data from current game state
      const today = getTodaySeed();
      const guessCount = game.currentRow + 1;
      const paletteData = {
        date: today,
        colors: game.hiddenPattern,
        scheme: game.currentScheme || "custom",
        guessCount,
        won
      };
      
      await performSave(currentSession.access_token, paletteData);
    } catch (error: any) {
      setSaveError(error?.message || "Error saving palette");
      setSaving(false);
    }
  };

  const handleShareResults = () => {
    // Create a wordle-style grid showing game progress
    const grid: string[] = [];
    
    game.rowResults.forEach((row: any[], rowIndex: number) => {
      let rowStr = '';
      row.forEach((result: string | null) => {
        if (result === 'correct') {
          rowStr += '🟩'; // Green for correct
        } else if (result === 'misplaced') {
          rowStr += '🟧'; // Orange for wrong spot
        } else if (result === 'wrong') {
          rowStr += '⬜'; // White for not in palette
        } else {
          rowStr += '⬜'; // Default to white for empty
        }
      });
      if (rowStr) grid.push(rowStr);
    });

    const result = won ? '✅ Won!' : '❌ Lost';
    const guesses = game.currentRow + 1;
    const text = `ColorChase ${getTodaySeed()}\n${result} in ${guesses} guesses\n\n${grid.join('\n')}\n\nPlay at colorchase.com`;
    
    navigator.clipboard?.writeText(text).then(() => {
      setShareMessage('Copied to clipboard!');
      setTimeout(() => setShareMessage(null), 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
      setShareMessage('Failed to copy');
      setTimeout(() => setShareMessage(null), 2000);
    });
  };

  // Auto-save after login
  useEffect(() => {
    if (user && session && pendingSaveRef.current && gameDataRef.current) {
      console.log('Auto-save triggered with data:', gameDataRef.current);
      (async () => {
        try {
          const { data: { session: currentSession } } = await (await import("@/app/lib/supabase")).supabase.auth.getSession();
          if (currentSession?.access_token) {
            console.log('Auto-saving palette after login...');
            await performSave(currentSession.access_token, gameDataRef.current);
          }
        } catch (error: any) {
          console.error('Auto-save error:', error);
          setSaveError(error?.message || "Error saving palette after login");
        }
      })();
    }
  }, [user, session]);


  return (
    <>
      {/* Info overlay */}
      {game.showInfo && (
        <div id="info-overlay" className="overlay visible">
          <div className="info-content">
            <h2>How to Play</h2>
            <div className="info-icon"><span>🎨</span><p>Guess the hidden 5-color palette in 5 tries</p></div>
            <div className="info-icon"><span>🔵</span><p>Click colors on the wheel to fill each row</p></div>
            <div className="info-icon"><span>🟢</span><p>Green border = right color, right spot</p></div>
            <div className="info-icon"><span>🟠</span><p>Orange border = right color, wrong spot</p></div>
            <div className="info-icon"><span>✕</span><p>X mark = color not in today's palette</p></div>
            <div className="info-icon"><span>💾</span><p>Win or lose, collect each day's palette!</p></div>
            <div className="info-icon"><span>👤</span><p>Create an account to save your collection</p></div>
            <div className="info-buttons">
              <button id="close-info" onClick={() => game.closeInfo && game.closeInfo()}>Got It!</button>
              <button id="create-account-info" className="secondary-btn" onClick={() => { game.closeInfo && game.closeInfo(); window.location.href = '/auth/signup'; }}>Create Account</button>
            </div>
          </div>
        </div>
      )}

      {/* Stats overlay */}
      {game.showStats && (
        <div id="stats-overlay" className="overlay visible">
          <div className="stats-content">
            <h2>Your Statistics</h2>
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-number" id="stat-played">0</div>
                <div className="stat-label">Played</div>
              </div>
              <div className="stat-box">
                <div className="stat-number" id="stat-win-pct">0</div>
                <div className="stat-label">Win %</div>
              </div>
              <div className="stat-box">
                <div className="stat-number" id="stat-streak">0</div>
                <div className="stat-label">Current Streak</div>
              </div>
              <div className="stat-box">
                <div className="stat-number" id="stat-max-streak">0</div>
                <div className="stat-label">Max Streak</div>
              </div>
            </div>
            <h3>Guess Distribution</h3>
            <div className="guess-distribution" id="guess-distribution"></div>
            <button id="close-stats" onClick={() => game.closeStats && game.closeStats()}>Close</button>
          </div>
        </div>
      )}
      {won && !game.showLogin && !game.showStats && !game.showInfo && (
        <div id="victory-overlay" className="overlay visible">
          <div id="victory-message">You Won!</div>
          <p className="overlay-subtitle">Today's palette is yours to collect</p>
          <div id="reveal-pattern" style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {game.hiddenPattern.map((c: string, i: number) => (
              <div key={i} style={{ width: 40, height: 40, background: c || '#fff', borderRadius: 6, border: '1px solid #ccc' }} />
            ))}
          </div>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
            <button 
              onClick={handleSavePalette}
              disabled={saving}
              style={{
                backgroundColor: '#6366f1',
                border: 'none',
                color: '#fff',
                padding: '14px 32px',
                fontSize: '16px',
                fontWeight: 'bold',
                borderRadius: '25px',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                minWidth: '200px',
              }}
            >
              {saving ? 'Saving...' : 'Save Today\'s Palette'}
            </button>
            {saveError && <p style={{ color: '#ff6b6b', marginTop: 0, fontSize: 14 }}>{saveError}</p>}
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={handleShareResults}
                style={{
                  backgroundColor: 'transparent',
                  border: '2px solid #d97706',
                  color: '#d97706',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  minWidth: '140px',
                }}
              >
                Share Results
              </button>
              {shareMessage && <p style={{ color: '#fbbf24', marginTop: 0, fontSize: 12 }}>{shareMessage}</p>}
              <button 
                onClick={() => game.resetGameForReplay()}
                style={{
                  backgroundColor: 'transparent',
                  border: '2px solid #d97706',
                  color: '#d97706',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  minWidth: '140px',
                }}
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      {lost && !game.showLogin && !game.showStats && !game.showInfo && (
        <div id="try-again-overlay" className="overlay visible">
          <div id="try-again-message">Better Luck Tomorrow!</div>
          <p className="overlay-subtitle">Here was today's palette</p>
          <div id="reveal-pattern-lose" style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {game.hiddenPattern.map((c: string, i: number) => (
              <div key={i} style={{ width: 40, height: 40, background: c || '#fff', borderRadius: 6, border: '1px solid #ccc' }} />
            ))}
          </div>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
            <button 
              onClick={handleSavePalette}
              disabled={saving}
              style={{
                backgroundColor: '#6366f1',
                border: 'none',
                color: '#fff',
                padding: '14px 32px',
                fontSize: '16px',
                fontWeight: 'bold',
                borderRadius: '25px',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                minWidth: '200px',
              }}
            >
              {saving ? 'Saving...' : 'Save Today\'s Palette'}
            </button>
            {saveError && <p style={{ color: '#ff6b6b', marginTop: 0, fontSize: 14 }}>{saveError}</p>}
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={handleShareResults}
                style={{
                  backgroundColor: 'transparent',
                  border: '2px solid #d97706',
                  color: '#d97706',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  minWidth: '140px',
                }}
              >
                Share Results
              </button>
              <button 
                onClick={() => game.resetGameForReplay()}
                style={{
                  backgroundColor: 'transparent',
                  border: '2px solid #d97706',
                  color: '#d97706',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  minWidth: '140px',
                }}
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login / info / stats overlays remain present but hidden until wired to state */}
    </>
  );
}