"use client";

import React, { useEffect, useState } from "react";

type Palette = {
  date: string;
  colors: string[];
  scheme?: string;
  isFavorite?: boolean;
  won?: boolean;
};

export default function PlayerClient() {
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await fetch("/api/palettes");
        if (res.ok) {
          const data = await res.json();
          if (mounted) setPalettes(data);
          return;
        }
      } catch (e) {
        // fall through to localStorage
      }

      try {
        const raw = localStorage.getItem("colorChasePalettes") || localStorage.getItem("palettes");
        const parsed = raw ? JSON.parse(raw) : null;
        if (parsed && Array.isArray(parsed) && mounted) setPalettes(parsed);
      } catch (e) {
        // ignore
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  function copyHex(hex: string, el?: HTMLElement | null) {
    navigator.clipboard?.writeText(hex).then(() => {
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

  async function toggleFavorite(date: string, btn: HTMLButtonElement) {
    // optimistic UI
    setPalettes(prev => prev.map(p => p.date === date ? { ...p, isFavorite: !p.isFavorite } : p));
    try {
      const res = await fetch(`/api/palettes/${date}/favorite`, { method: 'POST' });
      if (!res.ok) throw new Error('not ok');
      const data = await res.json();
      setPalettes(prev => prev.map(p => p.date === date ? { ...p, isFavorite: data.isFavorite } : p));
    } catch (e) {
      // keep optimistic or revert — keep optimistic to avoid noise
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

  return (
    <div className="player-container">
      <nav className="player-nav">
        <div className="player-nav-left">
          <a href="/" className="player-home-btn" aria-label="Home">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5"/><path d="M9 22V12h6v10"/></svg>
          </a>
        </div>

        <h1 className="player-title">My Collection</h1>

        <div className="player-stats">
          <div className="player-stat">
            <div className="player-stat-value">{streaks.current}</div>
            <div className="player-stat-label">CURRENT STREAK</div>
          </div>
          <div className="player-stat">
            <div className="player-stat-value" id="palettes-count">{palettes.length}</div>
            <div className="player-stat-label">PALETTES</div>
          </div>
          <div className="player-stat">
            <div className="player-stat-value">{streaks.best}</div>
            <div className="player-stat-label">BEST STREAK</div>
          </div>
        </div>
      </nav>

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
        {filtered.length === 0 ? (
          <div className="player-empty">
            <div className="player-empty-text">No palettes yet.</div>
            <div className="player-empty-actions">
              <button
                className="player-seed-btn"
                onClick={() => {
                  // seed a couple of example palettes into localStorage
                  const today = new Date();
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  const examples: Palette[] = [
                    {
                      date: today.toISOString().slice(0,10),
                      colors: ['#f5a99b','#caa0ff','#f6a8e6','#9fd6ff','#cbff96'],
                      scheme: 'triadic',
                      isFavorite: false,
                      won: true
                    },
                    {
                      date: yesterday.toISOString().slice(0,10),
                      colors: ['#9fbfcf','#c8f2f2','#dff6f6','#6d93ad','#9fb8e6'],
                      scheme: 'triadic',
                      isFavorite: true,
                      won: true
                    }
                  ];
                  try {
                    const existingRaw = localStorage.getItem('colorChasePalettes') || localStorage.getItem('palettes');
                    let merged = examples;
                    if (existingRaw) {
                      const parsed = JSON.parse(existingRaw);
                      if (Array.isArray(parsed)) merged = [...parsed, ...examples];
                    }
                    localStorage.setItem('colorChasePalettes', JSON.stringify(merged));
                    setPalettes(merged);
                  } catch (e) {
                    console.error('seed error', e);
                  }
                }}
              >
                Seed example palettes
              </button>
              <button 
                className="player-clear-btn"
                onClick={() => {
                  try {
                    localStorage.removeItem('colorChasePalettes');
                    setPalettes([]);
                  } catch(e){}
                }}
              >
                Clear
              </button>
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
                    <div className="palette-date">{new Date(p.date).toLocaleDateString()}</div>
                    <div className="palette-scheme">{p.scheme || ''}</div>
                  </div>
                  <div className="palette-actions">
                    <button 
                      className="action-btn copy" 
                      title="Copy first hex" 
                      onClick={() => { if (p.colors[0]) copyHex(p.colors[0]); }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
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
                <div className="hex-codes">
                  {p.colors.map((c, i) => (
                    <div 
                      key={i}
                      className="hex-code"
                      onClick={() => copyHex(c)}
                      title="Click to copy"
                    >
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
