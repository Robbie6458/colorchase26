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
            const isClickable = rowIndex === currentRow && tile;
            return (
              <div
                key={colIndex}
                className={`tile ${result ? result : ""} ${isClickable ? 'clickable' : ''}`}
                style={{ backgroundColor: (tile as string) || undefined }}
                onClick={() => {
                  if (isClickable) onClearTile(rowIndex, colIndex);
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
