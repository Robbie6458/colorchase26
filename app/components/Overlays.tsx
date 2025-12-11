"use client";

type GameAny = any;

export default function Overlays({ game }: { game: GameAny }) {

  const won = game.rowResults.some((r: any) => r.every((cell: any) => cell === "correct"));
  const lost = game.gameComplete && !won;

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
      {won && (
        <div id="victory-overlay" className="overlay visible">
          <div id="victory-message">You Won!</div>
          <p className="overlay-subtitle">Today's palette is yours to collect</p>
          <div id="reveal-pattern" style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {game.hiddenPattern.map((c, i) => (
              <div key={i} style={{ width: 40, height: 40, background: c || '#fff', borderRadius: 6, border: '1px solid #ccc' }} />
            ))}
          </div>
          <div className="overlay-buttons" style={{ marginTop: 16 }}>
            <button onClick={() => { /* TODO: save */ }}>Save Today's Palette</button>
            <button className="secondary-btn" onClick={() => { /* TODO: share */ }}>Share Results</button>
            <button className="secondary-btn" onClick={() => game.resetGameForReplay()}>Play Again</button>
          </div>
        </div>
      )}

      {lost && (
        <div id="try-again-overlay" className="overlay visible">
          <div id="try-again-message">Better Luck Tomorrow!</div>
          <p className="overlay-subtitle">Here was today's palette</p>
          <div id="reveal-pattern-lose" style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {game.hiddenPattern.map((c, i) => (
              <div key={i} style={{ width: 40, height: 40, background: c || '#fff', borderRadius: 6, border: '1px solid #ccc' }} />
            ))}
          </div>
          <div className="overlay-buttons" style={{ marginTop: 16 }}>
            <button onClick={() => { /* TODO: save */ }}>Save Today's Palette</button>
            <button className="secondary-btn" onClick={() => { /* TODO: share */ }}>Share Results</button>
            <button className="secondary-btn" onClick={() => game.resetGameForReplay()}>Play Again</button>
          </div>
        </div>
      )}

      {/* Login / info / stats overlays remain present but hidden until wired to state */}
    </>
  );
}
