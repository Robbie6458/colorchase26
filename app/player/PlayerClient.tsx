"use client";

import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Overlays from "../components/Overlays";
import DailyStats from "../components/DailyStats";
import Footer from "../components/Footer";
import PaletteInfoModal from "../components/PaletteInfoModal";
import { useAuth } from "../lib/auth-context";
import { supabase } from "../lib/supabase";

type Palette = {
  date: string;
  colors: string[];
  scheme?: string;
  isFavorite?: boolean;
  won?: boolean;
  palette_name?: string;
  palette_description?: string;
  best_used_for?: string[];
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
  const [selectedPalette, setSelectedPalette] = useState<Palette | null>(null);
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
            console.log('Fetching palettes with auth token...');
            const res = await fetch("/api/palettes", {
              headers: {
                "Authorization": `Bearer ${currentSession.access_token}`
              }
            });
            console.log('API response status:', res.status);
            if (res.ok) {
              const data = await res.json();
              console.log('API version:', data.version);
              const palettesArray = data.palettes || data; // Support both old and new format
              console.log('Palettes received:', palettesArray.length);
              // Wait for both the fetch and minimum load time to complete
              await minLoadTime;
              if (mounted) {
                setPalettes(palettesArray);
                // Clear localStorage after successful database fetch
                localStorage.removeItem("colorChasePalettes");
                localStorage.removeItem("palettes");
                setIsLoading(false);
                setLoadedOnce(true);
              }
              return;
            } else {
              const errorText = await res.text();
              console.error('Failed to fetch palettes:', res.status, errorText);
              await minLoadTime;
              if (mounted) {
                setIsLoading(false);
                setLoadedOnce(true);
              }
              return;
            }
          } else {
            console.log('No access token found');
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

  async function generatePaletteImage(p: Palette): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Instagram Story size: 1080x1920
      canvas.width = 1080;
      canvas.height = 1920;

      // Background - dark gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, '#1a1a1a');
      bgGradient.addColorStop(1, '#0a0a0a');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Color blocks stacked vertically with hex codes on each
      const colorBlockHeight = 280;
      p.colors.forEach((color, i) => {
        const blockY = i * colorBlockHeight;
        
        // Draw color block
        ctx.fillStyle = color;
        ctx.fillRect(0, blockY, canvas.width, colorBlockHeight);
        
        // Draw hex code on the color block (bottom-left aligned)
        ctx.textAlign = 'left';
        ctx.font = 'bold 42px "Courier New", monospace';
        
        // Add semi-transparent background behind text for readability
        const textPadding = 15;
        const textWidth = ctx.measureText(color).width;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(
          20 - textPadding, 
          blockY + colorBlockHeight - 60 - textPadding, 
          textWidth + (textPadding * 2), 
          50 + (textPadding * 2)
        );
        
        // Draw the hex code text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(color, 20, blockY + colorBlockHeight - 25);
      });

      // Status badge in top-right corner if available
      if (p.won !== undefined) {
        const badge = p.won ? '✅ Won' : '❌ Lost';
        ctx.textAlign = 'right';
        ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        
        // Background for badge
        const badgeText = badge;
        ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        const badgeWidth = ctx.measureText(badgeText).width;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(
          canvas.width - badgeWidth - 50,
          20,
          badgeWidth + 40,
          70
        );
        
        // Badge text
        ctx.fillStyle = p.won ? '#4ade80' : '#f87171';
        ctx.fillText(badgeText, canvas.width - 30, 70);
      }

      // Add subtle shadow below color blocks
      const colorsEndY = 5 * colorBlockHeight;
      const shadowGradient = ctx.createLinearGradient(0, colorsEndY, 0, colorsEndY + 80);
      shadowGradient.addColorStop(0, 'rgba(0,0,0,0.5)');
      shadowGradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = shadowGradient;
      ctx.fillRect(0, colorsEndY, canvas.width, 80);

      // Text section - now with more room
      ctx.textAlign = 'center';
      let currentY = colorsEndY + 150;

      // Date
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 72px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      const [year, month, day] = p.date.split('-');
      const dateText = `${month}/${day}/${year}`;
      ctx.fillText(dateText, canvas.width / 2, currentY);
      currentY += 100;

      // Scheme name
      if (p.scheme) {
        ctx.font = '48px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillStyle = '#a0a0a0';
        const schemeText = p.scheme.charAt(0).toUpperCase() + p.scheme.slice(1) + ' Palette';
        ctx.fillText(schemeText, canvas.width / 2, currentY);
        currentY += 100;
      }

      // Branding at bottom (fixed position)
      ctx.font = 'bold 64px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Color Chase', canvas.width / 2, canvas.height - 160);

      // URL
      ctx.font = '40px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillStyle = '#888888';
      ctx.fillText('colorchasegame.com', canvas.width / 2, canvas.height - 90);

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate image'));
        }
      }, 'image/png');
    });
  }

  async function sharePalette(p: Palette) {
    try {
      // Generate Instagram Story sized image
      const imageBlob = await generatePaletteImage(p);
      
      // Try Web Share API first (works better on mobile)
      if (navigator.share && navigator.canShare) {
        const file = new File([imageBlob], `color-chase-story-${p.date}.png`, { type: 'image/png' });
        
        const shareData = {
          files: [file]
        };

        if (navigator.canShare(shareData)) {
          try {
            await navigator.share(shareData);
            setToastMessage('🎨 Shared!');
            setTimeout(() => setToastMessage(null), 2000);
            return;
          } catch (err) {
            console.log('Share cancelled:', err);
            // Fall through to download
          }
        }
      }

      // Fallback: Download the image
      const url = URL.createObjectURL(imageBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `color-chase-story-${p.date}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);

      setToastMessage('🎨 Story image downloaded!');
      setTimeout(() => setToastMessage(null), 2000);
      
    } catch (err) {
      console.error('Error generating story:', err);
      setToastMessage('❌ Failed to generate image');
      setTimeout(() => setToastMessage(null), 2000);
    }
  }

  function openSchemeModal(scheme: string) {
    setSelectedScheme(scheme);
    setShowSchemeModal(true);
  }

  function openPaletteInfo(palette: Palette) {
    setSelectedPalette(palette);
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
    
    // Filter only won palettes and sort by date descending
    const wonPalettes = palettes.filter(p => p.won);
    if (wonPalettes.length === 0) return { current: 0, best: 0 };
    
    const sorted = [...wonPalettes].sort((a,b) => +new Date(b.date) - +new Date(a.date));
    
    let current = 0;
    let best = 0;
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Check if most recent win is today or yesterday (grace period)
    const mostRecentDate = new Date(sorted[0].date + 'T00:00:00');
    mostRecentDate.setHours(0,0,0,0);
    const daysSinceMostRecent = Math.floor((+today - +mostRecentDate) / (1000*60*60*24));
    
    if (daysSinceMostRecent <= 1) {
      // Calculate current streak from most recent backwards
      let expectedDate = new Date(mostRecentDate);
      for (let i = 0; i < sorted.length; i++) {
        const paletteDate = new Date(sorted[i].date + 'T00:00:00');
        paletteDate.setHours(0,0,0,0);
        
        if (+paletteDate === +expectedDate) {
          current++;
          expectedDate.setDate(expectedDate.getDate() - 1);
        } else {
          break;
        }
      }
    }
    
    // Calculate max streak
    let temp = 1;
    best = 1;
    for (let i = 1; i < sorted.length; i++) {
      const currentDate = new Date(sorted[i].date + 'T00:00:00');
      currentDate.setHours(0,0,0,0);
      const prevDate = new Date(sorted[i-1].date + 'T00:00:00');
      prevDate.setHours(0,0,0,0);
      const diff = Math.floor((+prevDate - +currentDate) / (1000*60*60*24));
      
      if (diff === 1) {
        temp++;
        best = Math.max(best, temp);
      } else {
        temp = 1;
      }
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
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                    {/* Palette Name */}
                    {p.palette_name && (
                      <div style={{
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: 'var(--text-color)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {p.palette_name}
                      </div>
                    )}
                    {/* Date */}
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #999)' }}>
                      {(() => { const [y, m, d] = p.date.split('-'); return `${m}/${d}/${y}`; })()}
                    </div>
                    {/* Scheme */}
                    {p.scheme && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #999)', textTransform: 'capitalize' }}>
                        {p.scheme.replace('-', ' ')}
                      </div>
                    )}
                  </div>
                  <div className="palette-actions" style={{ display: 'flex', gap: '0.25rem' }}>
                    {/* Info Button */}
                    <button 
                      className="action-btn info" 
                      title="Palette details" 
                      onClick={() => openPaletteInfo(p)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="16" x2="12" y2="12"/>
                        <line x1="12" y1="8" x2="12.01" y2="8"/>
                      </svg>
                    </button>
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

      {/* Palette Info Modal */}
      {selectedPalette && (
        <PaletteInfoModal
          isOpen={!!selectedPalette}
          onClose={() => setSelectedPalette(null)}
          paletteName={selectedPalette.palette_name}
          scheme={selectedPalette.scheme || ''}
          date={selectedPalette.date}
          description={selectedPalette.palette_description}
          bestUsedFor={selectedPalette.best_used_for}
        />
      )}
      
      <Footer />
    </div>
  );
}
