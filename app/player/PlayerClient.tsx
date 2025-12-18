"use client";

import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Overlays from "../components/Overlays";
import DailyStats from "../components/DailyStats";
import Footer from "../components/Footer";
import { useAuth } from "../lib/auth-context";
import { supabase } from "../lib/supabase";

type Palette = {
  date: string;
  colors: string[];
  scheme?: string;
  isFavorite?: boolean;
  won?: boolean;
};

const SCHEME_DEFINITIONS: Record<string, string> = {
  "complementary": "Colors opposite each other on the color wheel, creating high contrast and visual tension. These pairs make each other appear more vibrant.",
  "analogous": "Colors that are adjacent to each other on the color wheel, creating harmonious and pleasing combinations with a cohesive feel.",
  "triadic": "Three colors evenly spaced around the color wheel, offering vibrant contrast while maintaining balance and harmony.",
  "tetradic": "Four colors arranged into two complementary pairs, providing rich color variety with multiple points of contrast.",
  "monochromatic": "Variations of a single hue using different shades, tints, and tones, creating a unified and elegant appearance.",
  "split-complementary": "A base color combined with the two colors adjacent to its complement, offering high contrast with less tension than complementary.",
};

export default function PlayerClient() {
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSchemeModal, setShowSchemeModal] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const { session } = useAuth();

  useEffect(() => {
    let mounted = true;

    async function load() {
      // Start minimum loading timer (2.5 seconds)
      const minLoadTime = new Promise(resolve => setTimeout(resolve, 2500));

      // Always try to fetch from database if authenticated
      if (session) {
        try {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (currentSession?.access_token) {
            const res = await fetch("/api/palettes", {
              headers: {
                "Authorization": `Bearer ${currentSession.access_token}`
              }
            });
            if (res.ok) {
              const data = await res.json();
              // Wait for both the fetch and minimum load time to complete
              await minLoadTime;
              if (mounted) {
                setPalettes(data);
                // Clear localStorage after successful database fetch
                localStorage.removeItem("colorChasePalettes");
                localStorage.removeItem("palettes");
                setIsLoading(false);
                setLoadedOnce(true);
              }
              return;
            } else {
              console.error('Failed to fetch palettes:', await res.text());
              await minLoadTime;
              if (mounted) {
                setIsLoading(false);
                setLoadedOnce(true);
              }
              return;
            }
          }
        } catch (e) {
          console.error('Error loading palettes:', e);
          await minLoadTime;
          if (mounted) {
            setIsLoading(false);
            setLoadedOnce(true);
          }
          return;
        }
      }

      // Only fall back to localStorage if not authenticated
      if (!session) {
        try {
          const raw = localStorage.getItem("colorChasePalettes") || localStorage.getItem("palettes");
          const parsed = raw ? JSON.parse(raw) : null;
          if (parsed && Array.isArray(parsed) && mounted) setPalettes(parsed);
        } catch (e) {
          // ignore
        }
        // Wait for minimum load time even for localStorage
        await minLoadTime;
        if (mounted) {
          setIsLoading(false);
          setLoadedOnce(true);
        }
      }
    }

    load();
    return () => { mounted = false; };
  }, [session]);

  function copyHex(hex: string, el?: HTMLElement | null) {
    navigator.clipboard?.writeText(hex).then(() => {
      setToastMessage(`Copied ${hex} to clipboard!`);
      setTimeout(() => setToastMessage(null), 2000);
      if (el) {
        el.classList.add("copied");
        setTimeout(() => el.classList.remove("copied"), 1000);
      }
    });
  }

  function downloadSVG(p: Palette) {
    const svg = `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"500\" height=\"100\">${p.colors.map((c,i)=>`<rect x=\"${i*100}\" y=\"0\" width=\"100\" height=\"100\" fill=\"${c}\"/>`).join("")}</svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `color-chase-${p.date}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function sharePalette(p: Palette) {
    const colors = p.colors.join(', ');
    const [year, month, day] = p.date.split('-');
    const shareData = {
      title: 'Color Chase Palette',
      text: `Check out this ${p.scheme || ''} color palette from Color Chase (${month}/${day}/${year}): ${colors}`,
      url: window.location.origin
    };

    // Use Web Share API if available (mobile)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = `${shareData.text}\n${shareData.url}`;
      navigator.clipboard?.writeText(shareText).then(() => {
        setToastMessage('Share text copied to clipboard!');
        setTimeout(() => setToastMessage(null), 2000);
      });
    }
  }

  function openSchemeModal(scheme: string) {
    setSelectedScheme(scheme);
    setShowSchemeModal(true);
  }

  async function toggleFavorite(date: string, btn: HTMLButtonElement) {
    // optimistic UI
    setPalettes(prev => prev.map(p => p.date === date ? { ...p, isFavorite: !p.isFavorite } : p));
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession?.access_token) {
        console.error('No session found');
        return;
      }
      
      const res = await fetch(`/api/palettes/${date}/favorite`, { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentSession.access_token}`
        }
      });
      if (!res.ok) throw new Error('not ok');
      const data = await res.json();
      setPalettes(prev => prev.map(p => p.date === date ? { ...p, isFavorite: data.isFavorite } : p));
    } catch (e) {
      console.error('Error toggling favorite:', e);
      // Revert optimistic update on error
      setPalettes(prev => prev.map(p => p.date === date ? { ...p, isFavorite: !p.isFavorite } : p));
    }
  }

  const filtered = showFavorites ? palettes.filter(p => p.isFavorite) : palettes;

  const computeStreaks = () => {
    if (!palettes || palettes.length === 0) return { current: 0, best: 0 };
    // simple heuristic: current streak = number of consecutive days from latest
    const sorted = [...palettes].sort((a,b) => +new Date(a.date) - +new Date(b.date));
    let current = 0;
    let best = 0;
    let temp = 0;
    for (let i = 0; i < sorted.length; i++) {
      if (i === 0) temp = 1;
      else {
        const curr = new Date(sorted[i].date); curr.setHours(0,0,0,0);
        const prev = new Date(sorted[i-1].date); prev.setHours(0,0,0,0);
        const diff = Math.floor((+curr - +prev) / (1000*60*60*24));
        temp = diff === 1 ? temp + 1 : 1;
      }
      best = Math.max(best, temp);
    }
    // current: walk from end
    const today = new Date(); today.setHours(0,0,0,0);
    for (let i = sorted.length - 1; i >= 0; i--) {
      const d = new Date(sorted[i].date); d.setHours(0,0,0,0);
      const daysDiff = Math.floor((+today - +d) / (1000*60*60*24));
      if (daysDiff <= 1) current++; else break;
      today.setDate(today.getDate() - 1);
    }
    return { current, best };
  };

  const streaks = computeStreaks();

  // minimal stub 'game' object so Header buttons and Overlays work on player page
  const stubGame: any = {
    showInfo,
    showLogin,
    showStats,
    openInfo: () => setShowInfo(true),
    closeInfo: () => setShowInfo(false),
    openLogin: () => setShowLogin(true),
    closeLogin: () => setShowLogin(false),
    openStats: () => setShowStats(true),
    closeStats: () => setShowStats(false),
    rowResults: [],
    gameComplete: false,
    hiddenPattern: palettes && palettes[0] ? palettes[0].colors : ['#fff','#fff','#fff','#fff','#fff'],
    resetGameForReplay: () => {}
  };

  return (
    <div className="player-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Use shared header for consistency */}
      <Header game={stubGame} isPlayerPage={true} />
      <Overlays game={stubGame} />

      <div className="player-filters-container">
        <div className="player-filter-buttons">
          <button 
            className={`player-filter-btn ${!showFavorites ? 'active' : ''}`}
            onClick={() => setShowFavorites(false)}
          >
            All Palettes
          </button>
          <button 
            className={`player-filter-btn ${showFavorites ? 'active' : ''}`}
            onClick={() => setShowFavorites(true)}
          >
            Favorites
          </button>
        </div>
      </div>

      <main className="player-main">
        {isLoading || !loadedOnce ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <style>{`
              @keyframes colorfulSpin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              @keyframes colorShift {
                0% { background: linear-gradient(45deg, #ff6b6b, #ffa94d); }
                25% { background: linear-gradient(45deg, #ffa94d, #ffd93d); }
                50% { background: linear-gradient(45deg, #6bcf7f, #4ecdc4); }
                75% { background: linear-gradient(45deg, #4ecdc4, #95e1d3); }
                100% { background: linear-gradient(45deg, #ff6b6b, #ffa94d); }
              }
              .loading-spinner {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                animation: colorfulSpin 2s linear infinite, colorShift 4s ease-in-out infinite;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
              }
            `}</style>
            <div className="loading-spinner"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="player-empty">
            <div className="player-empty-text">No palettes yet.</div>
            <div className="player-empty-actions">
            </div>
          </div>
        ) : (
          <div id="palette-grid" className="palette-grid">
            {filtered.map(p => (
              <div key={p.date} className="palette-card">
                <div className="palette-colors">
                  {p.colors.map((c, i) => (
                    <div 
                      key={i} 
                      className="swatch" 
                      style={{background:c}}
                      onClick={() => copyHex(c)}
                      title="Click to copy hex code"
                    >
                      <div className="hex-tooltip">{c}</div>
                    </div>
                  ))}
                </div>
                <div className="palette-info">
                  <div>
                    <div className="palette-date">{(() => { const [y, m, d] = p.date.split('-'); return `${m}/${d}/${y}`; })()}</div>
                    {p.scheme && (
                      <button 
                        className="palette-scheme"
                        onClick={() => openSchemeModal(p.scheme!)}
                        title="Learn about this color scheme"
                      >
                        {p.scheme}
                      </button>
                    )}
                  </div>
                  <div className="palette-actions">
                    <button 
                      className="action-btn share" 
                      title="Share palette" 
                      onClick={() => sharePalette(p)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="18" cy="5" r="3"/>
                        <circle cx="6" cy="12" r="3"/>
                        <circle cx="18" cy="19" r="3"/>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                      </svg>
                    </button>
                    <button 
                      className="action-btn download" 
                      title="Download SVG" 
                      onClick={() => downloadSVG(p)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </button>
                    <button 
                      className={`action-btn favorite ${p.isFavorite ? 'favorited' : ''}`}
                      title={p.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      onClick={(e) => toggleFavorite(p.date, e.currentTarget as HTMLButtonElement)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill={p.isFavorite? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <DailyStats />
      {toastMessage && (
        <div className="copy-toast">
          {toastMessage}
        </div>
      )}
      
      {/* Color Scheme Definition Modal */}
      {showSchemeModal && (
        <div 
          className="scheme-modal-overlay" 
          onClick={() => setShowSchemeModal(false)}
        >
          <div 
            className="scheme-modal-content" 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="scheme-modal-close" 
              onClick={() => setShowSchemeModal(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <h2 className="scheme-modal-title">{selectedScheme}</h2>
            <p className="scheme-modal-description">
              {SCHEME_DEFINITIONS[selectedScheme.toLowerCase()] || "A harmonious arrangement of colors."}
            </p>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}
