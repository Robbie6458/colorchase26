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
    <div style={{color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg,#0f1220 0%, #111428 100%)'}}>
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 28px',borderBottom:'1px solid rgba(255,255,255,0.03)'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <a href="/" aria-label="Home" style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:44,height:44,borderRadius:12,background:'rgba(255,255,255,0.04)',textDecoration:'none'}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5"/><path d="M9 22V12h6v10"/></svg>
          </a>
        </div>

        <h1 style={{margin:0,fontSize:44,letterSpacing:2,fontWeight:800,textAlign:'center'}}>My Collection</h1>

        <div style={{display:'flex',alignItems:'center',gap:24}}>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:20,fontWeight:700,color:'#9aa0ff'}}>{streaks.current}</div>
            <div style={{fontSize:11,color:'#a0a0c0',letterSpacing:1}}>CURRENT STREAK</div>
          </div>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:20,fontWeight:700,color:'#9aa0ff'}} id="palettes-count">{palettes.length}</div>
            <div style={{fontSize:11,color:'#a0a0c0',letterSpacing:1}}>PALETTES</div>
          </div>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:20,fontWeight:700,color:'#9aa0ff'}}>{streaks.best}</div>
            <div style={{fontSize:11,color:'#a0a0c0',letterSpacing:1}}>BEST STREAK</div>
          </div>
        </div>
      </nav>

      <div style={{display:'flex',justifyContent:'center',padding:18}}>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <button onClick={() => setShowFavorites(false)} style={{padding:'10px 18px',borderRadius:24,background: showFavorites? 'transparent' : 'linear-gradient(90deg,#667eea,#764ba2)',color:'white',border:'none',boxShadow: showFavorites? 'none' : '0 6px 20px rgba(102,126,234,0.18)'}}>All Palettes</button>
          <button onClick={() => setShowFavorites(true)} style={{padding:'10px 18px',borderRadius:24,background: showFavorites? 'linear-gradient(90deg,#667eea,#764ba2)' : 'transparent',color:'white',border:'1px solid rgba(255,255,255,0.06)'}}>Favorites</button>
        </div>
      </div>

      <main style={{padding:24,flex:1,overflowY:'auto'}}>
        {filtered.length === 0 ? (
          <div style={{textAlign:'center',color:'#a0a0c0',padding:40}}>
            <div style={{marginBottom:12}}>No palettes yet.</div>
            <div style={{display:'flex',gap:8,justifyContent:'center'}}>
              <button
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
                style={{padding:'8px 14px',borderRadius:8,background:'#667eea',color:'white',border:'none',cursor:'pointer'}}
              >Seed example palettes</button>
              <button onClick={() => {
                try {
                  localStorage.removeItem('colorChasePalettes');
                  setPalettes([]);
                } catch(e){}
              }} style={{padding:'8px 14px',borderRadius:8,background:'rgba(255,255,255,0.06)',color:'white',border:'none',cursor:'pointer'}}>Clear</button>
            </div>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:24}}>
            {filtered.map(p => (
              <div key={p.date} style={{background:'rgba(18,22,35,0.6)',borderRadius:10,overflow:'hidden',border:'1px solid rgba(255,255,255,0.04)',boxShadow:'0 8px 20px rgba(2,6,23,0.6)'}}>
                <div style={{display:'flex',height:110}}>
                  {p.colors.map((c, i) => (
                    <div key={i} onClick={() => copyHex(c)} style={{flex:1,background:c,position:'relative',cursor:'pointer',minHeight:110}}>
                      <div style={{position:'absolute',left:8,bottom:10,background:'rgba(0,0,0,0.6)',padding:'4px 8px',borderRadius:6,fontFamily:'monospace',fontSize:12,color:'#fff'}}>{c}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:14}}>
                  <div>
                    <div style={{color:'#a0a0c0',fontSize:13}}>{new Date(p.date).toLocaleDateString()}</div>
                    <div style={{color:'#9aa7ff',fontSize:12,textTransform:'capitalize'}}>{p.scheme || ''}</div>
                  </div>
                  <div style={{display:'flex',gap:10,alignItems:'center'}}>
                    <button title="Copy" onClick={() => { if (p.colors[0]) copyHex(p.colors[0]); }} style={{width:38,height:38,borderRadius:10,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.04)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>
                    <button title="Download" onClick={() => downloadSVG(p)} style={{width:38,height:38,borderRadius:10,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.04)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </button>
                    <button title="Favorite" onClick={(e) => toggleFavorite(p.date, e.currentTarget as HTMLButtonElement)} style={{width:38,height:38,borderRadius:10,background:p.isFavorite? '#ffd700':'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.04)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill={p.isFavorite? '#222' : 'none'} stroke={p.isFavorite? '#fff' : '#fff'} strokeWidth="1.2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
