"use client";

import React, { useEffect } from "react";
import type { TileResult } from "../hooks/useGame";

type Props = {
  rows: (string | null)[][];
  currentRow: number;
  rowResults?: (TileResult)[][];
  onClearTile: (rowIndex: number, colIndex: number) => void;
  onCheckRow?: () => void;
};

export default function GameGrid({ rows = [], currentRow = 0, rowResults = [], onClearTile }: Props) {
  return (
    <div id="game-grid">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((tile, colIndex) => {
            const result = rowResults[rowIndex]?.[colIndex];
            
            return (
              <div
                key={colIndex}
                data-row={rowIndex}
                data-col={colIndex}
                className={`tile ${result ? result : ""}`}
                style={{ backgroundColor: (tile as string) || undefined, pointerEvents: 'auto' }}
                onClick={() => {
                  if (!tile) return;
                  onClearTile(rowIndex, colIndex);
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
