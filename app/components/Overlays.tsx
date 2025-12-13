"use client";

import { savePalette } from "../lib/server-actions";
import { useAuth } from "../lib/auth-context";
import { getTodaySeed } from "../lib/palette";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type GameAny = any;

export default function Overlays({ game }: { game: GameAny }) {
  const router = useRouter();
  const { user, session } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const pendingSaveRef = useRef(false);

  const won = game.rowResults.some((r: any) => r.every((cell: any) => cell === "correct"));
  const lost = game.gameComplete && !won;

  const handleSavePalette = async () => {
    // If not logged in, open login dialog
    if (!session || !user) {
      pendingSaveRef.current = true;
      game.openLogin?.();
      return;
    }

    // User is logged in, proceed with save
    setSaving(true);
    setSaveError(null);

    try {
      const today = getTodaySeed();
      const guessCount = game.currentRow + 1;
      
      const result = await savePalette(
        today,
        game.hiddenPattern,
        game.currentScheme || "custom",
        guessCount,
        won
      );

      if (result.success) {
        setSaveError(null);
        // Redirect to collection page
        router.push('/player');
      }
    } catch (error: any) {
      setSaveError(error?.message || "Error saving palette");
    } finally {
      setSaving(false);
    }
  };

  // When login completes and user is now authenticated, auto-save if pendingSave was set
  if (user && session && pendingSaveRef.current) {
    pendingSaveRef.current = false;
    // Trigger save immediately
    handleSavePalette();
  }


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
              <button id="create-account-info" className="secondary-btn" onClick={() => { game.closeInfo && game.closeInfo(); game.openLogin && game.openLogin(); }}>Create Account</button>
            </div>
          </div>
        </div>
      )}

      {/* Login overlay */}
      {game.showLogin && (
        <div id="login-overlay" className="overlay visible">
          <div className="login-content">
            <h2>Save Your Collection</h2>
            <div className="palette-border" id="palette-border"></div>
            <button id="google-login-btn" className="google-btn hidden">Continue with Google</button>
            <div id="login-divider" className="login-divider hidden"><span>or</span></div>
            <input id="login-email" type="email" placeholder="Email address" />
            <input id="login-password" type="password" placeholder="Password" />
            <div className="login-actions">
              <button id="login-btn" onClick={() => game.closeLogin && game.closeLogin()}>Log In</button>
              <button id="signup-btn" onClick={() => game.closeLogin && game.closeLogin()}>Sign Up</button>
            </div>
            <button id="close-login-overlay" onClick={() => game.closeLogin && game.closeLogin()}>Cancel</button>
            <div id="login-error" className="error-message"></div>
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
                onClick={() => { /* TODO: implement social sharing */ }}
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
                onClick={() => { /* TODO: implement social sharing */ }}
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