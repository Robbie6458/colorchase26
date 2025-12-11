"use client";

import { useMemo } from "react";
import useGame from "../hooks/useGame";
import ColorWheel from "./ColorWheel";
import GameGrid from "./GameGrid";

export default function GameArea() {
  const game = useGame();

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
          ? `${game.colors.length > 0 ? "Puzzle ready" : ""} • ${
              {
                complementary: "Opposites attract.",
                triadic: "Three anchors form the base.",
                analogous: "Neighbors in harmony.",
                "split-complementary": "Split the difference.",
                tetradic: "Four corners unite.",
              }[game.currentScheme as keyof typeof SCHEME_HINTS] || "Find today's palette!"
            }`
          : "Loading..."}
      </div>
      <div className="game-container">
        <ColorWheel colors={game.colors} onSelect={game.addColorToRow} eliminated={game.eliminated} />
        <GameGrid rows={game.rows} rowResults={game.rowResults} currentRow={game.currentRow} onClearTile={game.clearTile} />
      </div>

      <div id="confetti-container"></div>
      {game.duplicate && (
        <div className="duplicate-msg" style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '8px 12px', borderRadius: 6, zIndex: 9999 }}>
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
};
