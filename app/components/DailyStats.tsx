"use client";

export default function DailyStats() {
  return (
    <footer className="game-footer">
      <div className="footer-stats">
        <div className="stat-item">
          <span className="stat-icon">🎨</span>
          <span className="stat-text"><span id="player-count">0</span> collected today</span>
        </div>
        <div className="stat-item" id="best-guess-stat" style={{display: 'none'}}>
          <span className="stat-icon">🏆</span>
          <span className="stat-text"><span id="best-player">—</span> got it in <span id="best-guess">—</span></span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">⏱️</span>
          <span className="stat-text">New palette in <span id="countdown">--:--:--</span></span>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-copyright">© 2026 Color Chase. All rights reserved.</p>
        <a href="/privacy" className="footer-link">Privacy Policy</a>
      </div>
    </footer>
  );
}
