"use client";

import { useAuth } from "../lib/auth-context";
import { getTodaySeed } from "../lib/palette";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import React from "react";

type GameAny = any;

export default function Overlays({ game }: { game: GameAny }) {
  const router = useRouter();
  const { user, session } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const pendingSaveRef = useRef(false);
  const gameDataRef = useRef<{
    date: string;
    colors: string[];
    scheme: string;
    guessCount: number;
    won: boolean;
  } | null>(null);

  // Save game data to localStorage for persistence through login flow
  const savePendingGameData = (data: any) => {
    gameDataRef.current = data;
    try {
      localStorage.setItem('_pendingPaletteData', JSON.stringify(data));
      pendingSaveRef.current = true;
      console.log('Saved pending palette data to localStorage:', data);
    } catch (e) {
      console.error('Failed to save pending data to localStorage:', e);
    }
  };

  // Restore game data from localStorage
  const getPendingGameData = () => {
    try {
      const stored = localStorage.getItem('_pendingPaletteData');
      if (stored) {
        const data = JSON.parse(stored);
        console.log('Restored pending palette data from localStorage:', data);
        return data;
      }
    } catch (e) {
      console.error('Failed to restore pending data from localStorage:', e);
    }
    return null;
  };

  // Clear pending data
  const clearPendingData = () => {
    gameDataRef.current = null;
    pendingSaveRef.current = false;
    try {
      localStorage.removeItem('_pendingPaletteData');
    } catch (e) {
      console.error('Failed to clear pending data:', e);
    }
  };

  const won = game.rowResults.some((r: any) => r.every((cell: any) => cell === "correct"));
  const lost = game.gameComplete && !won;

  const performSave = async (token: string, paletteData?: any) => {
    setSaving(true);
    setSaveError(null);

    try {
      // Use provided paletteData if available, otherwise try to get from localStorage
      const data = paletteData || getPendingGameData();
      if (!data) {
        throw new Error('No palette data to save');
      }

      const response = await fetch('/api/palettes/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save palette');
      }

      setSaveError(null);
      // Clear the pending save data
      clearPendingData();
      // Redirect to collection page
      router.push('/player');
    } catch (error: any) {
      setSaveError(error?.message || "Error saving palette");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePalette = async () => {
    console.log('handleSavePalette called - session:', !!session, 'user:', !!user);
    // If not logged in, open login dialog
    if (!session || !user) {
      // Store the game data for later using localStorage
      const today = getTodaySeed();
      const guessCount = game.currentRow + 1;
      const data = {
        date: today,
        colors: game.hiddenPattern,
        scheme: game.currentScheme || "custom",
        guessCount,
        won
      };
      savePendingGameData(data);
      game.openLogin?.();
      return;
    }

    // User is logged in, proceed with save
    try {
      const { data: { session: currentSession } } = await (await import("@/app/lib/supabase")).supabase.auth.getSession();
      if (!currentSession?.access_token) {
        throw new Error('No access token available');
      }
      
      // Create palette data from current game state
      const today = getTodaySeed();
      const guessCount = game.currentRow + 1;
      const paletteData = {
        date: today,
        colors: game.hiddenPattern,
        scheme: game.currentScheme || "custom",
        guessCount,
        won
      };
      
      await performSave(currentSession.access_token, paletteData);
    } catch (error: any) {
      setSaveError(error?.message || "Error saving palette");
      setSaving(false);
    }
  };

  const handleShareResults = async () => {
    // Create a wordle-style grid showing game progress
    const grid: string[] = [];
    
    game.rowResults.forEach((row: any[], rowIndex: number) => {
      let rowStr = '';
      row.forEach((result: string | null) => {
        if (result === 'correct') {
          rowStr += '🟩'; // Green for correct
        } else if (result === 'misplaced') {
          rowStr += '🟧'; // Orange for wrong spot
        } else if (result === 'wrong') {
          rowStr += '⬜'; // White for not in palette
        } else {
          rowStr += '⬜'; // Default to white for empty
        }
      });
      if (rowStr) grid.push(rowStr);
    });

    const result = won ? '✅ Won!' : '❌ Lost';
    const guesses = game.currentRow + 1;
    const date = getTodaySeed();
    const text = `Color Chase ${date}\n${result} in ${guesses}/5\n\n${grid.join('\n')}`;
    const url = window.location.origin;
    
    // Try Web Share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Color Chase',
          text: text,
          url: url
        });
        setShareMessage('Shared successfully!');
        setTimeout(() => setShareMessage(null), 2000);
        return;
      } catch (err) {
        // User cancelled or share failed, fall back to clipboard
        if ((err as Error).name === 'AbortError') {
          return; // User cancelled, don't show error
        }
      }
    }
    
    // Fallback to clipboard
    const shareText = `${text}\n\nPlay at ${url}`;
    navigator.clipboard?.writeText(shareText).then(() => {
      setShareMessage('📋 Copied to clipboard!');
      setTimeout(() => setShareMessage(null), 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
      setShareMessage('Failed to copy');
      setTimeout(() => setShareMessage(null), 2000);
    });
  };

  const handleCopyResults = () => {
    // Create a wordle-style grid showing game progress
    const grid: string[] = [];
    
    game.rowResults.forEach((row: any[], rowIndex: number) => {
      let rowStr = '';
      row.forEach((result: string | null) => {
        if (result === 'correct') {
          rowStr += '🟩';
        } else if (result === 'misplaced') {
          rowStr += '🟧';
        } else if (result === 'wrong') {
          rowStr += '⬜';
        } else {
          rowStr += '⬜';
        }
      });
      if (rowStr) grid.push(rowStr);
    });

    const result = won ? '✅ Won!' : '❌ Lost';
    const guesses = game.currentRow + 1;
    const date = getTodaySeed();
    const url = window.location.origin;
    const shareText = `Color Chase ${date}\n${result} in ${guesses}/5\n\n${grid.join('\n')}\n\nPlay at ${url}`;
    
    navigator.clipboard?.writeText(shareText).then(() => {
      setShareMessage('📋 Copied to clipboard!');
      setTimeout(() => setShareMessage(null), 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
      setShareMessage('Failed to copy');
      setTimeout(() => setShareMessage(null), 2000);
    });
  };

  // Auto-save after login
  useEffect(() => {
    console.log('Overlays useEffect triggered - user:', !!user, 'session:', !!session);
    if (user && session) {
      // Check localStorage for pending data
      const pendingData = getPendingGameData();
      console.log('Retrieved pending data from localStorage:', pendingData);
      
      if (pendingData) {
        console.log('Auto-save triggered with data:', pendingData);
        (async () => {
          try {
            const { data: { session: currentSession } } = await (await import("@/app/lib/supabase")).supabase.auth.getSession();
            console.log('Got session for auto-save:', !!currentSession?.access_token);
            if (currentSession?.access_token) {
              console.log('Auto-saving palette after login...');
              await performSave(currentSession.access_token, pendingData);
              // Clear the pending data after successful save
              clearPendingData();
            }
          } catch (error: any) {
            console.error('Auto-save error:', error);
            setSaveError(error?.message || "Error saving palette after login");
          }
        })();
      }
    }
  }, [user, session]);


  return (
    <>
      {/* Info overlay */}
      {game.showInfo && (
        <div id="info-overlay" className="overlay visible">
          <div className="info-content">
            <h2>How to Play</h2>
            <div className="info-icon"><span>🎨</span><p>Guess the hidden 5-color palette in 5 tries</p></div>
            <div className="info-icon"><span>🔵</span><p>Click colors on the wheel to fill each row</p></div>
            <div className="info-icon"><span>🟢</span><p>Green border = right color, right spot</p></div>
            <div className="info-icon"><span>🟠</span><p>Orange border = right color, wrong spot</p></div>
            <div className="info-icon"><span>✕</span><p>X mark = color not in today's palette</p></div>
            <div className="info-icon"><span>💾</span><p>Win or lose, collect each day's palette!</p></div>
            <div className="info-icon"><span>👤</span><p>Create an account to save your collection</p></div>
            <div className="info-buttons">
              <button id="close-info" onClick={() => game.closeInfo && game.closeInfo()}>Got It!</button>
            </div>
          </div>
        </div>
      )}

      {/* Stats overlay */}
      {game.showStats && (
        <StatsOverlay game={game} session={session} />
      )}
      {won && !game.showLogin && !game.showStats && !game.showInfo && (
        <div id="victory-overlay" className="overlay visible">
          <style>{`
            @keyframes slideInDown {
              from {
                opacity: 0;
                transform: translateY(-20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            @keyframes popIn {
              0% {
                opacity: 0;
                transform: scale(0.8);
              }
              50% {
                transform: scale(1.1);
              }
              100% {
                opacity: 1;
                transform: scale(1);
              }
            }
            #victory-overlay #victory-message {
              animation: slideInDown 0.6s ease-out;
            }
            #victory-overlay #reveal-pattern > div {
              animation: popIn 0.6s ease-out;
              animation-fill-mode: both;
            }
            #victory-overlay #reveal-pattern > div:nth-child(1) { animation-delay: 0.1s; }
            #victory-overlay #reveal-pattern > div:nth-child(2) { animation-delay: 0.2s; }
            #victory-overlay #reveal-pattern > div:nth-child(3) { animation-delay: 0.3s; }
            #victory-overlay #reveal-pattern > div:nth-child(4) { animation-delay: 0.4s; }
            #victory-overlay #reveal-pattern > div:nth-child(5) { animation-delay: 0.5s; }
          `}</style>
          <div id="victory-message">You Won!</div>
          <p className="overlay-subtitle">Today's palette is yours to collect</p>
          <div id="reveal-pattern" style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'center' }}>
            {game.hiddenPattern.map((c: string, i: number) => (
              <div key={i} style={{ width: 60, height: 60, background: c || '#fff', borderRadius: 8, border: '2px solid rgba(255,255,255,0.3)', boxShadow: '0 8px 16px rgba(0,0,0,0.3)' }} />
            ))}
          </div>
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', width: '100%' }}>
            <button 
              onClick={handleSavePalette}
              disabled={saving}
              style={{
                backgroundColor: '#6366f1',
                border: 'none',
                color: '#fff',
                padding: '14px 32px',
                fontSize: '16px',
                fontWeight: 'bold',
                borderRadius: '25px',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                transition: 'all 0.2s ease',
              }}
            >
              {saving ? 'Saving...' : 'Save Today\'s Palette'}
            </button>
            {saveError && <p style={{ color: '#ff6b6b', marginTop: 0, fontSize: 14 }}>{saveError}</p>}
            {shareMessage && <p style={{ color: '#fbbf24', marginTop: 0, fontSize: 12 }}>{shareMessage}</p>}
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', width: '100%', flexWrap: 'wrap' }}>
              <button 
                onClick={handleCopyResults}
                style={{
                  backgroundColor: '#10b981',
                  border: 'none',
                  color: '#fff',
                  padding: '12px 28px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flex: '0 1 auto',
                }}
              >
                📋 Copy Result
              </button>
              <button 
                onClick={handleShareResults}
                style={{
                  backgroundColor: 'transparent',
                  border: '2px solid #d97706',
                  color: '#d97706',
                  padding: '12px 28px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flex: '0 1 auto',
                }}
              >
                Share
              </button>
              <button 
                onClick={() => game.resetGameForReplay()}
                style={{
                  backgroundColor: 'transparent',
                  border: '2px solid #d97706',
                  color: '#d97706',
                  padding: '12px 28px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flex: '0 1 auto',
                }}
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      {lost && !game.showLogin && !game.showStats && !game.showInfo && (
        <div id="try-again-overlay" className="overlay visible">
          <style>{`
            @keyframes slideInDown {
              from {
                opacity: 0;
                transform: translateY(-20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            @keyframes popIn {
              0% {
                opacity: 0;
                transform: scale(0.8);
              }
              50% {
                transform: scale(1.1);
              }
              100% {
                opacity: 1;
                transform: scale(1);
              }
            }
            #try-again-overlay #try-again-message {
              animation: slideInDown 0.6s ease-out;
            }
            #try-again-overlay #reveal-pattern-lose > div {
              animation: popIn 0.6s ease-out;
              animation-fill-mode: both;
            }
            #try-again-overlay #reveal-pattern-lose > div:nth-child(1) { animation-delay: 0.1s; }
            #try-again-overlay #reveal-pattern-lose > div:nth-child(2) { animation-delay: 0.2s; }
            #try-again-overlay #reveal-pattern-lose > div:nth-child(3) { animation-delay: 0.3s; }
            #try-again-overlay #reveal-pattern-lose > div:nth-child(4) { animation-delay: 0.4s; }
            #try-again-overlay #reveal-pattern-lose > div:nth-child(5) { animation-delay: 0.5s; }
          `}</style>
          <div id="try-again-message">Better Luck Tomorrow!</div>
          <p className="overlay-subtitle">Here was today's palette</p>
          <div id="reveal-pattern-lose" style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'center' }}>
            {game.hiddenPattern.map((c: string, i: number) => (
              <div key={i} style={{ width: 60, height: 60, background: c || '#fff', borderRadius: 8, border: '2px solid rgba(255,255,255,0.3)', boxShadow: '0 8px 16px rgba(0,0,0,0.3)' }} />
            ))}
          </div>
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', width: '100%' }}>
            <button 
              onClick={handleSavePalette}
              disabled={saving}
              style={{
                backgroundColor: '#6366f1',
                border: 'none',
                color: '#fff',
                padding: '14px 32px',
                fontSize: '16px',
                fontWeight: 'bold',
                borderRadius: '25px',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                transition: 'all 0.2s ease',
              }}
            >
              {saving ? 'Saving...' : 'Save Today\'s Palette'}
            </button>
            {saveError && <p style={{ color: '#ff6b6b', marginTop: 0, fontSize: 14 }}>{saveError}</p>}
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', width: '100%', flexWrap: 'wrap' }}>
              <button 
                onClick={handleCopyResults}
                style={{
                  backgroundColor: '#10b981',
                  border: 'none',
                  color: '#fff',
                  padding: '12px 28px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flex: '0 1 auto',
                }}
              >
                📋 Copy Result
              </button>
              <button 
                onClick={handleShareResults}
                style={{
                  backgroundColor: 'transparent',
                  border: '2px solid #d97706',
                  color: '#d97706',
                  padding: '12px 28px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flex: '0 1 auto',
                }}
              >
                Share
              </button>
              <button 
                onClick={() => game.resetGameForReplay()}
                style={{
                  backgroundColor: 'transparent',
                  border: '2px solid #d97706',
                  color: '#d97706',
                  padding: '12px 28px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flex: '0 1 auto',
                }}
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login / info / stats overlays remain present but hidden until wired to state */}
    </>
  );
}

function StatsOverlay({ game, session }: { game: any, session: any }) {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function loadStats() {
      if (!session?.access_token) {
        // Show zeros for non-logged in users
        setStats({ played: 0, winPct: 0, currentStreak: 0, maxStreak: 0, distribution: {} });
        return;
      }

      try {
        const res = await fetch('/api/palettes', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch palettes');
        const palettes = await res.json();

        const played = palettes.length;
        const won = palettes.filter((p: any) => p.won).length;
        const winPct = played > 0 ? Math.round((won / played) * 100) : 0;

        // Calculate streaks
        const sorted = [...palettes].sort((a: any, b: any) => +new Date(b.date) - +new Date(a.date));
        let currentStreak = 0;
        let maxStreak = 0;
        let tempStreak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < sorted.length; i++) {
          const d = new Date(sorted[i].date);
          d.setHours(0, 0, 0, 0);
          const daysDiff = Math.floor((+today - +d) / (1000 * 60 * 60 * 24));
          
          if (i === 0 && daysDiff <= 1) {
            currentStreak = 1;
            tempStreak = 1;
          } else if (i > 0) {
            const prevDate = new Date(sorted[i - 1].date);
            prevDate.setHours(0, 0, 0, 0);
            const diff = Math.floor((+prevDate - +d) / (1000 * 60 * 60 * 24));
            if (diff === 1) {
              tempStreak++;
              if (i === currentStreak) currentStreak++;
            } else {
              tempStreak = 1;
            }
          }
          maxStreak = Math.max(maxStreak, tempStreak);
        }

        // Guess distribution
        const distribution: any = {};
        palettes.forEach((p: any) => {
          if (p.won && p.guessCount) {
            distribution[p.guessCount] = (distribution[p.guessCount] || 0) + 1;
          }
        });

        setStats({ played, winPct, currentStreak, maxStreak, distribution });
      } catch (error) {
        console.error('Error loading stats:', error);
        setStats({ played: 0, winPct: 0, currentStreak: 0, maxStreak: 0, distribution: {} });
      }
    }

    loadStats();
  }, [session]);

  if (!stats) return null;

  const maxCount = Math.max(...Object.values(stats.distribution).map((v: any) => v || 0), 1);

  return (
    <div id="stats-overlay" className="overlay visible">
      <div className="stats-content">
        <h2>Your Statistics</h2>
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-number">{stats.played}</div>
            <div className="stat-label">Played</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{stats.winPct}</div>
            <div className="stat-label">Win %</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{stats.currentStreak}</div>
            <div className="stat-label">Current Streak</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{stats.maxStreak}</div>
            <div className="stat-label">Max Streak</div>
          </div>
        </div>
        <button id="close-stats" onClick={() => game.closeStats && game.closeStats()}>Close</button>
      </div>
    </div>
  );
}
