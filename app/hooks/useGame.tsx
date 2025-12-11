"use client";

import { useCallback, useEffect, useState } from "react";
import { getTodaySeed, generateDailyColorWheel, generatePaletteByScheme } from "../lib/palette";

export type Tile = string | null;
export type TileResult = "correct" | "misplaced" | "wrong" | null;

export default function useGame() {
  const [colors, setColors] = useState<string[]>([]);
  const [hiddenPattern, setHiddenPattern] = useState<string[]>([]);
  const [rows, setRows] = useState<Tile[][]>(() => Array.from({ length: 5 }, () => Array(5).fill(null)));
  const [rowResults, setRowResults] = useState<TileResult[][]>(() => Array.from({ length: 5 }, () => Array(5).fill(null)));
  const [currentRow, setCurrentRow] = useState(0);
  const [eliminated, setEliminated] = useState<Set<string>>(new Set());
  const [duplicate, setDuplicate] = useState(false);
  const [currentScheme, setCurrentScheme] = useState<string>("");
  const [gameComplete, setGameComplete] = useState(false);

  const generatePuzzle = useCallback(() => {
    const today = getTodaySeed();
    const rngSeed = today + "main";
    const wheelData = generateDailyColorWheel(today);
    setColors(wheelData.colors);
    setCurrentScheme((prev) => wheelData ? (prev || "") : "");
    const schemes = ["complementary", "triadic", "analogous", "split-complementary", "tetradic"];
    const schemeIndex = Math.floor(Math.random() * schemes.length);
    const scheme = schemes[schemeIndex];
    setCurrentScheme(scheme);
    const pattern = generatePaletteByScheme(scheme, wheelData.colors, today);
    setHiddenPattern(pattern);
    setRows(Array.from({ length: 5 }, () => Array(5).fill(null)));
    setRowResults(Array.from({ length: 5 }, () => Array(5).fill(null)));
    setCurrentRow(0);
    setEliminated(new Set());
    setGameComplete(false);
  }, []);

  useEffect(() => {
    generatePuzzle();
  }, [generatePuzzle]);

  function addColorToRow(color: string) {
    if (gameComplete) return;
    // prevent duplicate color within the current guess
    setRows(prev => {
      const next = prev.map(r => [...r]);
      const row = next[currentRow];
      if (row.includes(color)) {
        setDuplicate(true);
        setTimeout(() => setDuplicate(false), 1500);
        return next;
      }
      const idx = row.findIndex(c => !c);
      if (idx !== -1) {
        row[idx] = color;
      }
      return next;
    });
  }

  function clearTile(rowIndex: number, colIndex: number) {
    if (gameComplete) return;
    if (rowIndex !== currentRow) return;
    setRows(prev => {
      const next = prev.map(r => [...r]);
      next[rowIndex][colIndex] = null;
      return next;
    });
  }

  function checkRow() {
    const row = rows[currentRow];
    if (row.some(c => !c)) return; // not full

    const patternCopy = [...hiddenPattern];
    const results: TileResult[] = new Array(5).fill("wrong");
    let correctCount = 0;

    row.forEach((color, index) => {
      if (color === patternCopy[index]) {
        results[index] = "correct";
        patternCopy[index] = null as any;
        correctCount++;
      }
    });

    row.forEach((color, index) => {
      if (results[index] !== "wrong") return;
      const colorIndex = patternCopy.indexOf(color as string);
      if (colorIndex !== -1) {
        results[index] = "misplaced";
        patternCopy[colorIndex] = null as any;
      } else {
        results[index] = "wrong";
        // Only mark eliminated if the color is not part of the hidden pattern
        if (!hiddenPattern.includes(color as string)) {
          setEliminated(prev => new Set([...prev, color as string]));
        }
      }
    });

    setRowResults(prev => {
      const next = prev.map(r => [...r]);
      next[currentRow] = results;
      return next;
    });

    if (correctCount === 5) {
      setGameComplete(true);
      return { result: "win", results };
    }

    if (currentRow === 4) {
      setGameComplete(true);
      return { result: "lose", results };
    }

    setCurrentRow(r => r + 1);
    return { result: "continue", results };
  }

  function resetGameForReplay() {
    generatePuzzle();
  }

  return {
    colors,
    hiddenPattern,
    rows,
    rowResults,
    currentRow,
    eliminated,
    currentScheme,
    gameComplete,
    addColorToRow,
    clearTile,
    checkRow,
    resetGameForReplay,
    generatePuzzle,
    duplicate,
  };
}
