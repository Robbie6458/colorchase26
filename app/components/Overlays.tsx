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

  const handleShareResults = () => {
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
        <div 
          className="game-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              game.closeInfo && game.closeInfo();
            }
          }}
        >
          <div className="overlay-card">
            <h2 className="overlay-title">How to Play</h2>
            <div className="info-list">
              <div className="info-item">
                <span className="info-emoji">🎨</span>
                <p>Guess the hidden 5-color palette in 5 tries</p>
              </div>
              <div className="info-item">
                <span className="info-emoji">🔵</span>
                <p>Click colors on the wheel to fill each row</p>
              </div>
              <div className="info-item">
                <span className="info-emoji">🟢</span>
                <p>Green border = right color, right spot</p>
              </div>
              <div className="info-item">
                <span className="info-emoji">🟠</span>
                <p>Orange border = right color, wrong spot</p>
              </div>
              <div className="info-item">
                <span className="info-emoji">✕</span>
                <p>X mark = color not in today's palette</p>
              </div>
              <div className="info-item">
                <span className="info-emoji">💾</span>
                <p>Win or lose, collect each day's palette!</p>
              </div>
              <div className="info-item">
                <span className="info-emoji">👤</span>
                <p>Create an account to save your collection</p>
              </div>
            </div>
            <button className="primary-button" onClick={() => game.closeInfo && game.closeInfo()}>
              Got It!
            </button>
          </div>
        </div>
      )}

      {/* Stats overlay */}
      {game.showStats && (
        <StatsOverlay game={game} session={session} />
      )}

      {/* Victory overlay */}
      {won && !game.showLogin && !game.showStats && !game.showInfo && (
        <div 
          className="game-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              // Don't close victory overlay by clicking outside
            }
          }}
        >
          <div className="overlay-card">
            <h2 className="victory-title">You Won!</h2>
            <p className="overlay-subtitle">Today's palette is yours to collect</p>
            
            <div className="color-reveal">
              {game.hiddenPattern.map((c: string, i: number) => (
                <div 
                  key={i} 
                  className="reveal-color"
                  style={{ backgroundColor: c, animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>

            <button 
              className="primary-button save-button"
              onClick={handleSavePalette}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Today\'s Palette'}
            </button>

            {saveError && <p className="error-message">{saveError}</p>}
            {shareMessage && <p className="success-message">{shareMessage}</p>}

            <div className="action-buttons">
              <button className="share-button" onClick={handleShareResults}>
                Share Results
              </button>
              <button className="secondary-button" onClick={() => game.resetGameForReplay()}>
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Defeat overlay */}
      {lost && !game.showLogin && !game.showStats && !game.showInfo && (
        <div 
          className="game-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              // Don't close defeat overlay by clicking outside
            }
          }}
        >
          <div className="overlay-card">
            <h2 className="defeat-title">Better Luck Tomorrow!</h2>
            <p className="overlay-subtitle">Here was today's palette</p>
            
            <div className="color-reveal">
              {game.hiddenPattern.map((c: string, i: number) => (
                <div 
                  key={i} 
                  className="reveal-color"
                  style={{ backgroundColor: c, animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>

            <button 
              className="primary-button save-button"
              onClick={handleSavePalette}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Today\'s Palette'}
            </button>

            {saveError && <p className="error-message">{saveError}</p>}
            {shareMessage && <p className="success-message">{shareMessage}</p>}

            <div className="action-buttons">
              <button className="share-button" onClick={handleShareResults}>
                Share Results
              </button>
              <button className="secondary-button" onClick={() => game.resetGameForReplay()}>
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function StatsOverlay({ game, session }: { game: any, session: any }) {
  const [stats, setStats] = useState<any>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);

  // Close when clicking outside the modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (overlayRef.current === event.target) {
        game.closeStats && game.closeStats();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [game]);

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
        const data = await res.json();
        const palettes = data.palettes || data; // Handle both v2.0 format and legacy format

        const played = palettes.length;
        const won = palettes.filter((p: any) => p.won).length;
        const winPct = played > 0 ? Math.round((won / played) * 100) : 0;

        // Calculate streaks
        const wonPalettes = palettes.filter((p: any) => p.won);
        const sorted = [...wonPalettes].sort((a: any, b: any) => +new Date(b.date) - +new Date(a.date));
        let currentStreak = 0;
        let maxStreak = 0;
        let tempStreak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (sorted.length > 0) {
          // Check if most recent win is today or yesterday (grace period)
          const mostRecentDate = new Date(sorted[0].date + 'T00:00:00');
          mostRecentDate.setHours(0, 0, 0, 0);
          const daysSinceMostRecent = Math.floor((+today - +mostRecentDate) / (1000 * 60 * 60 * 24));
          
          if (daysSinceMostRecent <= 1) {
            // Calculate current streak from most recent backwards
            let expectedDate = new Date(mostRecentDate);
            for (let i = 0; i < sorted.length; i++) {
              const paletteDate = new Date(sorted[i].date + 'T00:00:00');
              paletteDate.setHours(0, 0, 0, 0);
              
              if (+paletteDate === +expectedDate) {
                currentStreak++;
                expectedDate.setDate(expectedDate.getDate() - 1);
              } else {
                break;
              }
            }
          }
          
          // Calculate max streak
          tempStreak = 1;
          maxStreak = 1;
          for (let i = 1; i < sorted.length; i++) {
            const currentDate = new Date(sorted[i].date + 'T00:00:00');
            currentDate.setHours(0, 0, 0, 0);
            const prevDate = new Date(sorted[i - 1].date + 'T00:00:00');
            prevDate.setHours(0, 0, 0, 0);
            const diff = Math.floor((+prevDate - +currentDate) / (1000 * 60 * 60 * 24));
            
            if (diff === 1) {
              tempStreak++;
              maxStreak = Math.max(maxStreak, tempStreak);
            } else {
              tempStreak = 1;
            }
          }
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

  return (
    <div className="game-overlay" ref={overlayRef}>
      <div className="overlay-card">
        <h2 className="overlay-title">Your Statistics</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{stats.played}</div>
            <div className="stat-label">Played</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.winPct}</div>
            <div className="stat-label">Win %</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.currentStreak}</div>
            <div className="stat-label">Current Streak</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.maxStreak}</div>
            <div className="stat-label">Max Streak</div>
          </div>
        </div>
        <button className="primary-button" onClick={() => game.closeStats && game.closeStats()}>
          Close
        </button>
      </div>
    </div>
  );
}
