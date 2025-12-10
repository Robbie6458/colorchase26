"use client";

export default function Overlays() {
  return (
    <>
      <div id="victory-overlay" className="hidden">
        <div id="victory-message">You Won!</div>
        <p className="overlay-subtitle">Today's palette is yours to collect</p>
        <div id="reveal-pattern"></div>
        <div className="overlay-buttons">
          <button id="save-palette">Save Today's Palette</button>
          <button id="share-results" className="secondary-btn">Share Results</button>
          <button id="play-again" className="secondary-btn">Play Again</button>
        </div>
      </div>

      <div id="try-again-overlay" className="hidden">
        <div id="try-again-message">Better Luck Tomorrow!</div>
        <p className="overlay-subtitle">Here was today's palette</p>
        <div id="reveal-pattern-lose"></div>
        <div className="overlay-buttons">
          <button id="save-palette-lose">Save Today's Palette</button>
          <button id="share-results-lose" className="secondary-btn">Share Results</button>
          <button id="play-again-lose" className="secondary-btn">Play Again</button>
        </div>
      </div>

      <div id="login-overlay" className="hidden">
        <div className="login-content">
          <h2>Save Your Collection</h2>
          <div className="palette-border" id="palette-border"></div>
          <button id="google-login-btn" className="google-btn hidden">
            <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18Z"/><path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17Z"/><path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07Z"/><path fill="#EA4335" d="M8.98 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59a8 8 0 0 0-12.17 3.07l2.67 2.07A4.8 4.8 0 0 1 8.98 3.58Z"/></svg>
            Continue with Google
          </button>
          <div id="login-divider" className="login-divider hidden">
            <span>or</span>
          </div>
          <input type="email" id="login-email" placeholder="Email address" />
          <input type="password" id="login-password" placeholder="Password" />
          <div className="login-actions">
            <button id="login-btn">Log In</button>
            <button id="signup-btn">Sign Up</button>
          </div>
          <button id="close-login-overlay">Cancel</button>
          <div id="login-error" className="error-message"></div>
        </div>
      </div>

      <div id="info-overlay" className="hidden">
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
            <button id="close-info">Got It!</button>
            <button id="create-account-info" className="secondary-btn">Create Account</button>
          </div>
        </div>
      </div>

      <div id="stats-overlay" className="hidden">
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
          <button id="close-stats">Close</button>
        </div>
      </div>
    </>
  );
}
