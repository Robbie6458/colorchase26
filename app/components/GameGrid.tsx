"use client";

import type { TileResult } from "../hooks/useGame";

type Props = {
  rows: (string | null)[][];
  currentRow: number;
  rowResults?: (TileResult)[][];
  onClearTile: (rowIndex: number, colIndex: number) => void;
};

export default function GameGrid({ rows = [], currentRow = 0, rowResults = [], onClearTile }: Props) {
  return (
    <div id="game-grid" aria-label="Five guesses, five colors per guess">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((tile, colIndex) => {
            const result = rowResults[rowIndex]?.[colIndex];
            return (
              <button
                type="button"
                key={colIndex}
                className={`tile ${result ? result : ""}`}
                style={{ backgroundColor: (tile as string) || undefined }}
                aria-label={`Guess ${rowIndex + 1}, color ${colIndex + 1}: ${tile || 'empty'}${result ? `, ${result}` : ''}${rowIndex === currentRow && tile ? ', click to clear' : ''}`}
                disabled={rowIndex !== currentRow || !tile}
                onClick={() => onClearTile(rowIndex, colIndex)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
