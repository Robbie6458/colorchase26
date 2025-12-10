"use client";

export default function GameArea() {
  return (
    <div className="game-wrapper">
      <h1 id="game-title"></h1>
      <div id="hint"></div>
      <div className="game-container">
        <div id="color-wheel"></div>
        <div id="game-grid"></div>
      </div>

      <div id="confetti-container"></div>
    </div>
  );
}
