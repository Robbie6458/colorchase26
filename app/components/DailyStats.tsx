"use client";

export default function DailyStats() {
  return (
    <div className="daily-stats">
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
  );
}
