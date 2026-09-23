"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type Tile = string | null;
export type TileResult = "correct" | "misplaced" | "wrong" | null;

export default function useGame() {
  const [colors, setColors] = useState<string[]>([]);
  const [hiddenPattern, setHiddenPattern] = useState<string[]>([]);
  const [puzzleDate, setPuzzleDate] = useState("");
  const [gameError, setGameError] = useState<string | null>(null);
  const [checkingGuess, setCheckingGuess] = useState(false);
  const submittingRef = useRef(false);
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
      setPuzzleDate(data.date);
      setCurrentScheme(data.scheme);
      setHiddenPattern(data.revealedPalette || []);
      setRows([...data.guesses.map((guess: string[]) => [...guess]), ...Array.from({ length: 5 - data.guesses.length }, () => Array(5).fill(null))]);
      setRowResults([...data.rowResults, ...Array.from({ length: 5 - data.rowResults.length }, () => Array(5).fill(null))]);
      setCurrentRow(Math.min(data.guesses.length, 4));
      setEliminated(new Set(data.eliminatedColors));
      setGameComplete(data.complete);
      setGameError(null);
    } catch (error) {
      console.error('Error loading puzzle:', error);
      // DO NOT fallback to client-side generation - all players must get the same palette
      // Show error to user instead
      setGameError('Today\'s puzzle is not available yet. Please try again shortly.');
    }
  }, []);

  useEffect(() => {
    generatePuzzle();
  }, [generatePuzzle]);

  // Audio for add/remove feedback
  const audioRef = useRef<AudioContext | null>(null);
  useEffect(() => {
    try {
      const AudioConstructor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioConstructor) audioRef.current = new AudioConstructor();
    } catch {
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
    if (gameComplete || submittingRef.current) return;

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
  }, [currentRow, gameComplete, playAddSound]);

  const clearTile = useCallback((rowIndex: number, colIndex: number) => {
    if (gameComplete || submittingRef.current) return;
    if (rowIndex !== currentRow) return;
      setRows(prev => {
        const next = prev.map(r => [...r]);
        next[rowIndex][colIndex] = null;
        try { playRemoveSound(); } catch (e) {}
        return next;
      });
  }, [currentRow, gameComplete, playRemoveSound]);

  const launchConfetti = useCallback((revealedColors?: string[]) => {
    try {
      const confettiContainer = document.getElementById('confetti-container');
      if (!confettiContainer) return;
      confettiContainer.innerHTML = '';

      const paletteColors = revealedColors?.length ? revealedColors : (hiddenPattern.length > 0 ? hiddenPattern : colors.slice(0, 5));
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

  const checkRow = useCallback(async () => {
    const row = rows[currentRow];
    if (gameComplete || submittingRef.current || !row || row.some(c => !c)) return;
    submittingRef.current = true;
    setCheckingGuess(true);
    try {
      const response = await fetch('/api/guess', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guess: row }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not check your guess');
      setGameError(null);
      setRowResults(prev => prev.map((result, index) => index === currentRow ? data.result : result));
      if (data.revealedPalette) setHiddenPattern(data.revealedPalette);
      if (data.complete) {
        setGameComplete(true);
        if (data.won) try { launchConfetti(data.revealedPalette); } catch (e) {}
      } else {
        setEliminated(prev => new Set([...prev, ...row.filter((color, index) => data.result[index] === 'wrong' && color)] as string[]));
        setCurrentRow(currentRow + 1);
      }
      try { playAddSound(); } catch (e) {}
    } catch (error) {
      setGameError(error instanceof Error ? error.message : 'Could not check your guess');
    } finally {
      submittingRef.current = false;
      setCheckingGuess(false);
    }
  }, [currentRow, rows, gameComplete, playAddSound, launchConfetti]);

  const resumeAudio = useCallback(() => {
    try {
      const ctx = audioRef.current;
      if (ctx && ctx.state === 'suspended') ctx.resume();
    } catch (e) {}
  }, []);

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

  return {
    colors,
    hiddenPattern,
    puzzleDate,
    gameError,
    checkingGuess,
    rows,
    rowResults,
    currentRow,
    eliminated,
    currentScheme,
    gameComplete,
    addColorToRow,
    clearTile,
    checkRow,
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
