"use client";

export default function Header() {
  return (
    <header className="game-header">
      <a href="/player" className="nav-link" id="player-link">My Collection</a>
      <div className="header-right">
        <div id="streak-display" className="streak-badge hidden">
          <span className="streak-icon">🔥</span>
          <span id="streak-count">0</span>
        </div>
        <button id="stats-btn" className="header-icon-btn" aria-label="Statistics">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </button>
        <div id="auth-status">
          <button id="header-login-btn" className="auth-btn">Log In</button>
        </div>
        <button id="info-btn" aria-label="How to play">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </button>
      </div>
    </header>
  );
}
