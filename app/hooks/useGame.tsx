"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const [showInfo, setShowInfo] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const generatePuzzle = useCallback(async () => {
    try {
      // Fetch today's palette from the API
      const response = await fetch('/api/today-palette');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to fetch today\'s palette');
      }
      
      const data = await response.json();
      
      setColors(data.wheelColors);
      setCurrentScheme(data.scheme);
      setHiddenPattern(data.hiddenPalette);
      setRows(Array.from({ length: 5 }, () => Array(5).fill(null)));
      setRowResults(Array.from({ length: 5 }, () => Array(5).fill(null)));
      setCurrentRow(0);
      setEliminated(new Set());
      setGameComplete(false);
    } catch (error) {
      console.error('Error loading puzzle:', error);
      // DO NOT fallback to client-side generation - all players must get the same palette
      // Show error to user instead
      alert('Today\'s puzzle is not available yet. Please check back after 9am PST when the daily palette is generated.');
    }
  }, []);

  useEffect(() => {
    generatePuzzle();
  }, [generatePuzzle]);

  // Audio for add/remove feedback
  const audioRef = useRef<AudioContext | null>(null);
  useEffect(() => {
    try {
      audioRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      audioRef.current = null;
    }
    return () => {
      // do not close context; let browser manage it
    };
  }, []);

  const playAddSound = useCallback(() => {
    const audioContext = audioRef.current;
    if (!audioContext) return;
    try { if (audioContext.state === 'suspended') audioContext.resume(); } catch (e) {}
    const t = audioContext.currentTime;
    const bufferSize = audioContext.sampleRate * 0.12;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
    const noise = audioContext.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3000, t);
    filter.frequency.exponentialRampToValueAtTime(800, t + 0.12);
    filter.Q.setValueAtTime(1, t);
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.12, t);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    noise.start(t);
    noise.stop(t + 0.12);
  }, []);

  const playRemoveSound = useCallback(() => {
    const audioContext = audioRef.current;
    if (!audioContext) return;
    try { if (audioContext.state === 'suspended') audioContext.resume(); } catch (e) {}
    const t = audioContext.currentTime;
    const osc1 = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2000, t);
    filter.frequency.exponentialRampToValueAtTime(800, t + 0.05);
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(1800, t);
    osc1.frequency.exponentialRampToValueAtTime(600, t + 0.03);
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(3200, t);
    osc2.frequency.exponentialRampToValueAtTime(1200, t + 0.02);
    gainNode.gain.setValueAtTime(0.22, t);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.08);
    osc2.stop(t + 0.08);
  }, []);
  const addColorToRow = useCallback((color: string) => {
    if (gameComplete) return;

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
        try { playAddSound(); } catch (e) {}
      }
      return next;
    });
  }, [currentRow, gameComplete]);

  const clearTile = useCallback((rowIndex: number, colIndex: number) => {
    if (gameComplete) return;
    if (rowIndex !== currentRow) return;
      setRows(prev => {
        const next = prev.map(r => [...r]);
        next[rowIndex][colIndex] = null;
        try { playRemoveSound(); } catch (e) {}
        return next;
      });
  }, [currentRow, gameComplete]);

  const checkRow = useCallback(() => {
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
      try { playAddSound(); } catch (e) {}
      try { launchConfetti(); } catch (e) {}
      setGameComplete(true);
      return { result: "win", results };
    }

    if (currentRow === 4) {
      try { playAddSound(); } catch (e) {}
      setGameComplete(true);
      return { result: "lose", results };
    }

    // move to next row
    setCurrentRow(r => r + 1);
    try { playAddSound(); } catch (e) {}
    return { result: "continue", results };
  }, [currentRow, rows, hiddenPattern, playAddSound]);

  const resumeAudio = useCallback(() => {
    try {
      const ctx = audioRef.current;
      if (ctx && ctx.state === 'suspended') ctx.resume();
    } catch (e) {}
  }, []);

  const launchConfetti = useCallback(() => {
    try {
      const confettiContainer = document.getElementById('confetti-container');
      if (!confettiContainer) return;
      confettiContainer.innerHTML = '';

      const paletteColors = hiddenPattern.length > 0 ? hiddenPattern : colors.slice(0, 5);
      for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.backgroundColor = paletteColors[i % paletteColors.length];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
        confettiContainer.appendChild(confetti);
      }

      setTimeout(() => {
        if (confettiContainer) confettiContainer.innerHTML = '';
      }, 4000);
    } catch (e) {
      // ignore
    }
  }, [hiddenPattern, colors]);

  const openInfo = useCallback(() => setShowInfo(true), []);
  const closeInfo = useCallback(() => setShowInfo(false), []);
  const openLogin = useCallback(() => {
    // Redirect to login page instead of showing old overlay
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }, []);
  const closeLogin = useCallback(() => setShowLogin(false), []);
  const openStats = useCallback(() => setShowStats(true), []);
  const closeStats = useCallback(() => setShowStats(false), []);

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
    resumeAudio,
    launchConfetti,
    showInfo,
    openInfo,
    closeInfo,
    showLogin,
    openLogin,
    closeLogin,
    showStats,
    openStats,
    closeStats,
  };
}
