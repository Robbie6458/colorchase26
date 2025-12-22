"use client";

import { useMemo, useEffect } from "react";
import useGame from "../hooks/useGame";
import ColorWheel from "./ColorWheel";
import GameGrid from "./GameGrid";

type GameAny = any;

export default function GameArea({ game }: { game: GameAny }) {

  // auto-evaluate row when it becomes full
  useEffect(() => {
    if (!game.rows[game.currentRow]) return;
    const rowFull = game.rows[game.currentRow].every((tile: string | null) => tile !== null);
    if (rowFull) {
      game.checkRow();
    }
  }, [game.rows, game.currentRow, game.checkRow]);

  // ensure audio can play after a user gesture: resume audio context on first pointerdown
  useEffect(() => {
    function handleFirstInteraction() {
      try {
        if ((game as any).resumeAudio) (game as any).resumeAudio();
      } catch (e) {}
      window.removeEventListener('pointerdown', handleFirstInteraction);
    }
    window.addEventListener('pointerdown', handleFirstInteraction, { once: true });
    return () => window.removeEventListener('pointerdown', handleFirstInteraction);
  }, [game]);

  const titleColors = useMemo(() => {
    const titleText = "COLOR CHASE";
    return titleText.split("").map((char, i) => ({
      char,
      color: char !== " " ? game.colors[i % game.colors.length] : undefined,
    }));
  }, [game.colors]);

  return (
    <div className="game-wrapper">
      <h1 id="game-title">
        {titleColors.map((item, i) => (
          <span key={i} style={item.color ? { color: item.color } : {}}>
            {item.char}
          </span>
        ))}
      </h1>
      <div id="hint" style={{ textAlign: "center", marginBottom: "1rem", fontSize: "0.9rem", color: "#666" }}>
        {game.currentScheme && game.colors.length > 0
          ? `Puzzle ready • ${SCHEME_HINTS[game.currentScheme as keyof typeof SCHEME_HINTS] || "Find today's palette!"}`
          : "Loading..."}
      </div>
      <div className="game-container">
        <ColorWheel colors={game.colors} onSelect={game.addColorToRow} eliminated={game.eliminated} />
        <GameGrid rows={game.rows} rowResults={game.rowResults} currentRow={game.currentRow} onClearTile={game.clearTile} />
      </div>

      <div id="confetti-container"></div>
      {game.duplicate && (
        <div 
          className="duplicate-msg" 
          style={{ 
            position: 'fixed', 
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0, 0, 0, 0.9)',
            color: '#ffa500',
            padding: '8px 12px',
            borderRadius: 6,
            zIndex: 9999,
            fontSize: '0.9rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: '0 4px 12px rgba(255, 165, 0, 0.3)',
            border: '1px solid rgba(255, 165, 0, 0.3)',
          }}
        >
          Already in this guess
        </div>
      )}
    </div>
  );
}

const SCHEME_HINTS = {
  complementary: "Opposites attract.",
  triadic: "Three anchors form the base.",
  analogous: "Neighbors in harmony.",
  "split-complementary": "Split the difference.",
  tetradic: "Four corners unite.",
  square: "Perfect balance in four.",
  rectangular: "Double pairs create harmony.",
  accent: "One color stands out.",
};
